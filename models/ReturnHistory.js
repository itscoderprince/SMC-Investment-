import mongoose from 'mongoose';

const returnHistorySchema = new mongoose.Schema(
    {
        indexId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Index',
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
            min: 3,
            max: 100
        },
        totalInvestments: {
            type: Number,
            default: 0
        },
        totalPrincipal: {
            type: Number,
            default: 0
        },
        totalDistributed: {
            type: Number,
            default: 0
        },
        investorCount: {
            type: Number,
            default: 0
        },
        distributedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        distributedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending'
        },
        notes: {
            type: String
        },
        details: [{
            investmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Investment'
            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            amount: Number,
            returnAmount: Number,
            success: Boolean
        }]
    },
    {
        timestamps: true
    }
);

// Indexes
returnHistorySchema.index({ indexId: 1 });
returnHistorySchema.index({ weekStart: 1, weekEnd: 1 });
returnHistorySchema.index({ distributedAt: -1 });
returnHistorySchema.index({ status: 1 });

// Virtual to populate index
returnHistorySchema.virtual('index', {
    ref: 'Index',
    localField: 'indexId',
    foreignField: '_id',
    justOne: true
});

// Virtual for week label
returnHistorySchema.virtual('weekLabel').get(function () {
    const start = new Date(this.weekStart);
    const end = new Date(this.weekEnd);
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-IN', options)} - ${end.toLocaleDateString('en-IN', options)}`;
});

// Static to get distribution history
returnHistorySchema.statics.getHistory = async function (limit = 10) {
    return await this.find({ status: 'completed' })
        .populate('index', 'name slug')
        .sort({ distributedAt: -1 })
        .limit(limit);
};

// Static to get total distributed
returnHistorySchema.statics.getTotalDistributed = async function () {
    const result = await this.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalDistributed' } } }
    ]);
    return result[0]?.total || 0;
};

// Static to check if already distributed for a week
returnHistorySchema.statics.isAlreadyDistributed = async function (indexId, weekStart, weekEnd) {
    const existing = await this.findOne({
        indexId,
        weekStart: { $gte: new Date(weekStart) },
        weekEnd: { $lte: new Date(weekEnd) },
        status: 'completed'
    });
    return !!existing;
};

export default mongoose.models.ReturnHistory || mongoose.model('ReturnHistory', returnHistorySchema);
