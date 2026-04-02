import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import Referral from '@/models/Referral';
import User from '@/models/User';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const userId = auth.user._id;

        // Get referrals for this user
        const referrals = await Referral.find({ referrerId: userId })
            .populate('referredUserId', 'name email createdAt')
            .sort({ createdAt: -1 })
            .lean();

        // Get aggregate stats
        const stats = await Referral.getStats(userId);

        // Get user's referral code and ensure it exists
        let user = await User.findById(userId).select('referralCode referralBonusEarned name');

        if (!user.referralCode) {
            // Generate referral code since it's missing
            const crypto = require('crypto');
            const namePart = (user.name || 'USR').replace(/\s+/g, '').substring(0, 4).toUpperCase();
            const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
            const generatedCode = `${namePart}${randPart}`;

            user.referralCode = generatedCode;
            await user.save();
        }

        return successResponse({
            referrals: referrals.map(ref => ({
                id: ref._id,
                user: ref.referredUserId,
                amount: ref.investmentAmount,
                bonus: ref.bonusAmount,
                status: ref.status,
                createdAt: ref.createdAt,
                creditedAt: ref.bonusCreditedAt
            })),
            stats,
            referralCode: user.referralCode,
            referralBonusEarned: user.referralBonusEarned
        }, 'Referral data retrieved');

    } catch (error) {
        console.error('Referral API error:', error);
        return errorResponse('Failed to get referral data', 500, error.message);
    }
}
