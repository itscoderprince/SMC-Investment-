import mongoose from 'mongoose';
import { generateId } from '@/lib/id';
import Investment from './Investment';
import Index from './Index';
import User from './User';
import Referral from './Referral';
import ReferralBonus from './ReferralBonus';

const paymentRequestSchema = new mongoose.Schema(
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
            min: [100, 'Minimum investment is $100']
        },
        requestId: {
            type: String,
            required: true,
            unique: true
        },
        status: {
            type: String,
            enum: ['initialized', 'pending', 'proof_uploaded', 'verified', 'approved', 'rejected', 'expired'],
            default: 'initialized'
        },
        paymentProof: {
            type: String
        },
        paymentMethod: {
            type: String,
            enum: ['bep20_usdt', 'trc20_usdt'],
            default: 'bep20_usdt'
        },
        transactionReference: {
            type: String
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: {
            type: Date
        },
        rejectionReason: {
            type: String
        },
        expiresAt: {
            type: Date
        },
        investmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Investment'
        },
        duration: {
            type: String,
            enum: ['flexible', '3m', '6m'],
            default: 'flexible'
        },
        notes: {
            type: String
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes
paymentRequestSchema.index({ userId: 1 });
paymentRequestSchema.index({ status: 1 });
paymentRequestSchema.index({ expiresAt: 1 });
paymentRequestSchema.index({ createdAt: -1 });

// Virtual to check if expired
paymentRequestSchema.virtual('isExpired').get(function () {
    return this.expiresAt && this.expiresAt < new Date() && (this.status === 'pending' || this.status === 'initialized');
});

// Virtual for time remaining
paymentRequestSchema.virtual('timeRemaining').get(function () {
    if (!this.expiresAt || (this.status !== 'pending' && this.status !== 'initialized')) return null;
    const remaining = this.expiresAt - new Date();
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
});

// Virtual to populate user
paymentRequestSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Virtual to populate index
paymentRequestSchema.virtual('index', {
    ref: 'Index',
    localField: 'indexId',
    foreignField: '_id',
    justOne: true
});

// Method to upload proof
paymentRequestSchema.methods.uploadProof = async function (proofUrl, transactionRef) {
    this.paymentProof = proofUrl;
    this.transactionReference = transactionRef;
    this.status = 'proof_uploaded';
    return await this.save();
};

// Method to approve payment and create investment
paymentRequestSchema.methods.approve = async function (adminId) {
    // Create investment
    const investment = await Investment.create({
        userId: this.userId,
        indexId: this.indexId,
        amount: this.amount,
        duration: this.duration || 'flexible',
        paymentRequestId: this._id,
        isActive: true,
        status: 'active',
        activatedAt: new Date()
    });

    // Update payment request
    this.status = 'approved';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    this.investmentId = investment._id;
    await this.save();

    // Check for referral bonus (5%)
    // Get user with referredBy populated
    const user = await User.findById(this.userId).select('referredBy');

    if (user && user.referredBy) {
        const bonusAmount = this.amount * 0.05; // 5% bonus

        // 1. Create a detailed bonus record
        await ReferralBonus.create({
            referrerId: user.referredBy,
            referredUserId: this.userId,
            investmentId: investment._id,
            investmentAmount: this.amount,
            bonusAmount: bonusAmount,
            status: 'credited'
        });

        // 2. Update the main Referral tracking record (for stats)
        const referral = await Referral.findOne({
            referredUserId: this.userId,
            referrerId: user.referredBy
        });

        if (referral) {
            // Update total bonus and last investment info in the main referral record
            await Referral.updateOne(
                { _id: referral._id },
                {
                    $inc: { bonusAmount: bonusAmount, investmentAmount: this.amount },
                    $set: {
                        status: 'bonus_credited',
                        investmentId: investment._id,
                        bonusCreditedAt: new Date()
                    }
                }
            );
        }

        // 3. Update referrer's total referral bonus earned for their wallet balance
        await User.findByIdAndUpdate(user.referredBy, {
            $inc: { referralBonusEarned: bonusAmount }
        });
    }


    // Update index stats
    const index = await Index.findById(this.indexId);
    if (index) {
        await index.updateStats();
    }

    return { paymentRequest: this, investment };

};

// Method to reject payment
paymentRequestSchema.methods.reject = async function (adminId, reason) {
    this.status = 'rejected';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    this.rejectionReason = reason;
    return await this.save();
};

// Static to get pending count
paymentRequestSchema.statics.getPendingCount = function () {
    return this.countDocuments({ status: 'proof_uploaded' });
};

// Static to expire old requests
paymentRequestSchema.statics.expireOldRequests = async function () {
    const result = await this.updateMany(
        {
            status: { $in: ['pending', 'initialized'] },
            expiresAt: { $lt: new Date() }
        },
        {
            $set: { status: 'expired' }
        }
    );
    return result.modifiedCount;
};

// Force model re-registration in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.PaymentRequest) {
        delete mongoose.models.PaymentRequest;
    }
}

const PaymentRequest = mongoose.models.PaymentRequest || mongoose.model('PaymentRequest', paymentRequestSchema, 'payment_requests');

export default PaymentRequest;
