import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
    {
        // The user who referred (owns the referral code)
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        // The user who signed up using the referral code
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true // each user can only be referred once
        },
        // The investment that triggered the bonus
        investmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Investment',
            default: null
        },
        // Investment amount that triggered the bonus
        investmentAmount: {
            type: Number,
            default: 0
        },
        // 5% of investment amount
        bonusAmount: {
            type: Number,
            default: 0
        },
        // Status of the referral
        status: {
            type: String,
            enum: ['pending', 'bonus_credited', 'expired'],
            default: 'pending'
        },
        // When the bonus was credited
        bonusCreditedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ createdAt: -1 });

// Static: get referral stats for a user
referralSchema.statics.getStats = async function (referrerId) {
    const stats = await this.aggregate([
        { $match: { referrerId: new mongoose.Types.ObjectId(referrerId) } },
        {
            $group: {
                _id: null,
                totalReferrals: { $sum: 1 },
                pendingReferrals: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                completedReferrals: { $sum: { $cond: [{ $eq: ['$status', 'bonus_credited'] }, 1, 0] } },
                totalBonusEarned: { $sum: '$bonusAmount' }
            }
        }
    ]);
    return stats[0] || { totalReferrals: 0, pendingReferrals: 0, completedReferrals: 0, totalBonusEarned: 0 };
};

const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);

export default Referral;
