import mongoose from 'mongoose';

const weeklyReturnSchema = new mongoose.Schema({
    week: {
        type: Number,
        required: true
    },
    weekStart: {
        type: Date,
        required: true
    },
    weekEnd: {
        type: Date,
        required: true
    },
    returnRate: {
        type: Number,
        required: true,
        min: -100,
        max: 1000
    },
    returnAmount: {
        type: Number,
        required: true
    },
    creditedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const investmentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        indexId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Index',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: [10, 'Minimum investment is $10']
        },
        paymentRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PaymentRequest'
        },
        totalReturns: {
            type: Number,
            default: 0
        },
        weeklyReturns: {
            type: [weeklyReturnSchema],
            default: []
        },
        duration: {
            type: String,
            enum: ['flexible', '3m', '6m'],
            default: 'flexible'
        },
        isActive: {
            type: Boolean,
            default: false
        },
        activatedAt: {
            type: Date
        },
        lastReturnDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'paused', 'completed', 'withdrawn'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes
investmentSchema.index({ indexId: 1 });
investmentSchema.index({ isActive: 1 });
investmentSchema.index({ userId: 1, indexId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ createdAt: -1 });
investmentSchema.index({ activatedAt: -1 });

// Virtual for total value (principal + returns)
investmentSchema.virtual('totalValue').get(function () {
    return this.amount + this.totalReturns;
});

// Virtual for ROI percentage
investmentSchema.virtual('roi').get(function () {
    if (this.amount === 0) return 0;
    return parseFloat(((this.totalReturns / this.amount) * 100).toFixed(2));
});

// Virtual for weeks active
investmentSchema.virtual('weeksActive').get(function () {
    if (!this.activatedAt) return 0;
    const now = new Date();
    const activated = new Date(this.activatedAt);
    const diffTime = Math.abs(now - activated);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
});

// Virtual for formatted amount
investmentSchema.virtual('amountFormatted').get(function () {
    return '$' + this.amount.toLocaleString('en-US');
});

// Virtual to populate user
investmentSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual to populate index
investmentSchema.virtual('index', {
    ref: 'Index',
    localField: 'indexId',
    foreignField: '_id',
    justOne: true
});

// Method to activate investment
investmentSchema.methods.activate = async function () {
    this.isActive = true;
    this.status = 'active';
    this.activatedAt = new Date();
    await this.save();

    // Update index stats
    const Index = mongoose.model('Index');
    const index = await Index.findById(this.indexId);
    if (index) {
        await index.updateStats();
    }

    return this;
};

// Method to add weekly return
investmentSchema.methods.addReturn = async function (returnData) {
    // Robustness: Check if this week already exists
    const exists = this.weeklyReturns.some(r =>
        new Date(r.weekStart).getTime() === new Date(returnData.weekStart).getTime() &&
        new Date(r.weekEnd).getTime() === new Date(returnData.weekEnd).getTime()
    );
    if (exists) return this;

    const weekNumber = this.weeklyReturns.length + 1;
    // Accuracy: Round to 2 decimal places to prevent floating point issues
    const returnAmount = Math.round((this.amount * returnData.returnRate) / 100 * 100) / 100;

    this.weeklyReturns.push({
        week: weekNumber,
        weekStart: returnData.weekStart,
        weekEnd: returnData.weekEnd,
        returnRate: returnData.returnRate,
        returnAmount,
        creditedAt: new Date()
    });

    this.totalReturns = Math.round((this.totalReturns + returnAmount) * 100) / 100;
    this.lastReturnDate = new Date();

    return await this.save();
};

// Method to pause investment
investmentSchema.methods.pause = async function () {
    this.isActive = false;
    this.status = 'paused';
    return await this.save();
};

// Method to resume investment
investmentSchema.methods.resume = async function () {
    this.isActive = true;
    this.status = 'active';
    return await this.save();
};

// Static to get user's total investment
investmentSchema.statics.getUserTotalInvestment = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()), isActive: true } },
        { $group: { _id: null, total: { $sum: '$amount' }, totalReturns: { $sum: '$totalReturns' } } }
    ]);
    return result[0] || { total: 0, totalReturns: 0 };
};

// Static to get user's total lifetime returns
investmentSchema.statics.getUserTotalReturns = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
        { $group: { _id: null, total: { $sum: '$totalReturns' } } }
    ]);
    return result[0]?.total || 0;
};

// Static to get user's total active principal
investmentSchema.statics.getUserTotalPrincipal = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()), status: { $in: ['active', 'completed', 'withdrawn'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
};

// Static to get user's investment summary
investmentSchema.statics.getUserSummary = async function (userId) {
    const result = await this.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                totalReturns: { $sum: '$totalReturns' }
            }
        }
    ]);

    const summary = {
        active: { count: 0, totalAmount: 0, totalReturns: 0 },
        pending: { count: 0, totalAmount: 0, totalReturns: 0 },
        completed: { count: 0, totalAmount: 0, totalReturns: 0 }
    };

    result.forEach(item => {
        if (summary[item._id]) {
            summary[item._id] = {
                count: item.count,
                totalAmount: item.totalAmount,
                totalReturns: item.totalReturns
            };
        }
    });

    return summary;
};

// Force model re-registration in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.Investment) {
        delete mongoose.models.Investment;
    }
}

const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema, 'investments');

export default Investment;
