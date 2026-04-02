import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import Referral from '@/models/Referral';
import User from '@/models/User';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success || auth.user.role !== 'admin' && auth.user.role !== 'master_admin') {
            return errorResponse('Unauthorized', 401);
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const referrals = await Referral.find(query)
            .populate('referrerId', 'name email')
            .populate('referredUserId', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Calculate global stats
        const globalStats = await Referral.aggregate([
            {
                $group: {
                    _id: null,
                    totalReferrals: { $sum: 1 },
                    totalBonusCredited: { $sum: '$bonusAmount' },
                    activeReferrers: { $addToSet: '$referrerId' }
                }
            }
        ]);

        return successResponse({
            referrals,
            stats: {
                totalReferrals: globalStats[0]?.totalReferrals || 0,
                totalBonusCredited: globalStats[0]?.totalBonusCredited || 0,
                activeReferrersCount: globalStats[0]?.activeReferrers?.length || 0
            }
        }, 'Admin referral data retrieved');

    } catch (error) {
        console.error('Admin Referral API error:', error);
        return errorResponse('Failed to get referral data', 500, error.message);
    }
}
