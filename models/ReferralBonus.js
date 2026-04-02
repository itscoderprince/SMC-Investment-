import mongoose from 'mongoose';

const referralBonusSchema = new mongoose.Schema(
    {
        referrerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        investmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Investment',
            required: true
        },
        investmentAmount: {
            type: Number,
            required: true
        },
        bonusAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['credited', 'reversed'],
            default: 'credited'
        }
    },
    {
        timestamps: true
    }
);

referralBonusSchema.index({ referrerId: 1, createdAt: -1 });

if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.ReferralBonus;
}

export default mongoose.models.ReferralBonus || mongoose.model('ReferralBonus', referralBonusSchema);
