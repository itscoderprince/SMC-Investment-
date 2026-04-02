import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import ReferralBonus from '@/models/ReferralBonus';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const userId = auth.user._id;

        // Get all individual bonuses credited to this user
        const bonuses = await ReferralBonus.find({ referrerId: userId })
            .populate('referredUserId', 'name email')
            .populate('investmentId', 'amount status activatedAt')
            .sort({ createdAt: -1 })
            .lean();

        return successResponse({
            bonuses: bonuses.map(b => ({
                id: b._id,
                user: b.referredUserId,
                investment: b.investmentId,
                investmentAmount: b.investmentAmount,
                bonusAmount: b.bonusAmount,
                status: b.status,
                createdAt: b.createdAt
            }))
        }, 'Referral bonuses retrieved');

    } catch (error) {
        console.error('Referral Bonuses API error:', error);
        return errorResponse('Failed to get referral bonuses', 500, error.message);
    }
}
