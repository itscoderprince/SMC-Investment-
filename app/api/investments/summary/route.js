import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import Index from '@/models/Index'; // Ensure registered for lookup
import User from '@/models/User'; // Ensure registered for requireAuth
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';

// GET - Get investment summary
export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Get summary by status
        const summary = await Investment.getUserSummary(user._id);

        // Get by index
        const byIndex = await Investment.aggregate([
            { $match: { userId: user._id, isActive: true } },
            {
                $lookup: {
                    from: 'indices',
                    localField: 'indexId',
                    foreignField: '_id',
                    as: 'index'
                }
            },
            { $unwind: '$index' },
            {
                $group: {
                    _id: '$indexId',
                    indexName: { $first: '$index.name' },
                    indexColor: { $first: '$index.color' },
                    totalAmount: { $sum: '$amount' },
                    totalReturns: { $sum: '$totalReturns' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Get monthly returns for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyReturns = await Investment.aggregate([
            { $match: { userId: user._id } },
            { $unwind: '$weeklyReturns' },
            { $match: { 'weeklyReturns.creditedAt': { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$weeklyReturns.creditedAt' },
                        month: { $month: '$weeklyReturns.creditedAt' }
                    },
                    totalReturns: { $sum: '$weeklyReturns.returnAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const totalInvested = summary.active.totalAmount + summary.pending.totalAmount;
        const totalReturns = summary.active.totalReturns + summary.completed.totalReturns;

        return successResponse({
            overview: {
                totalInvested,
                totalReturns,
                totalValue: totalInvested + totalReturns,
                roi: totalInvested > 0 ? ((totalReturns / totalInvested) * 100).toFixed(2) : 0,
                activeCount: summary.active.count,
                pendingCount: summary.pending.count
            },
            byStatus: summary,
            byIndex: byIndex.map(item => ({
                indexId: item._id,
                indexName: item.indexName,
                indexColor: item.indexColor,
                totalAmount: item.totalAmount,
                totalReturns: item.totalReturns,
                count: item.count
            })),
            monthlyReturns: monthlyReturns.map(item => ({
                month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
                totalReturns: item.totalReturns
            }))
        }, 'Investment summary retrieved');

    } catch (error) {
        console.error('Get investment summary error:', error);
        return errorResponse('Failed to get investment summary', 500, error.message);
    }
}
