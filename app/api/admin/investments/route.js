import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import User from '@/models/User';
import Index from '@/models/Index';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const search = searchParams.get('search');
        const status = searchParams.get('status');
        const indexId = searchParams.get('indexId');

        // Build query
        let query = {};

        if (status) {
            query.status = status;
        }

        if (indexId) {
            query.indexId = indexId;
        }

        if (search) {
            // Find users matching search
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);

            // Also search by index name if no users found or add to query
            const indices = await Index.find({
                name: { $regex: search, $options: 'i' }
            }).select('_id');
            const indexIds = indices.map(i => i._id);

            query.$or = [
                { userId: { $in: userIds } },
                { indexId: { $in: indexIds } },
                { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null } // Allow search by ID
            ].filter(c => c._id !== null || (c.userId && c.userId.$in.length > 0) || (c.indexId && c.indexId.$in.length > 0));

            if (query.$or.length === 0) {
                delete query.$or;
                // If search provided but no matches found, return empty
                if (users.length === 0 && indices.length === 0 && !search.match(/^[0-9a-fA-F]{24}$/)) {
                    return successResponse({
                        investments: [],
                        pagination: {
                            page: pagination.page,
                            limit: pagination.limit,
                            total: 0,
                            pages: 0
                        },
                        stats: {
                            totalActiveAmount: 0,
                            todayProfit: 0,
                            totalInvestors: 0,
                            pendingExits: 0
                        }
                    });
                }
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            total,
            investments,
            activeStats,
            investorStats,
            pendingExits,
            todayReturns
        ] = await Promise.all([
            Investment.countDocuments(query),
            Investment.find(query)
                .populate('userId', 'name email')
                .populate('indexId', 'name slug color')
                .sort({ createdAt: -1 })
                .skip((pagination.page - 1) * pagination.limit)
                .limit(pagination.limit)
                .lean(),
            Investment.aggregate([
                { $match: { status: 'active' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Investment.distinct('userId', { status: 'active' }),
            Investment.countDocuments({ status: 'completed' }),
            Investment.aggregate([
                { $unwind: '$weeklyReturns' },
                {
                    $match: {
                        'weeklyReturns.creditedAt': { $gte: today }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$weeklyReturns.returnAmount' }
                    }
                }
            ])
        ]);

        const totalActiveAmount = activeStats[0]?.total || 0;
        const totalInvestors = investorStats.length;
        const todayProfit = todayReturns[0]?.total || 0;

        const stats = {
            totalActiveAmount,
            todayProfit,
            totalInvestors,
            pendingExits
        };

        // Format investments for response
        const formattedInvestments = investments.map(inv => ({
            id: inv._id,
            _id: inv._id,
            userId: inv.userId?._id,
            userName: inv.userId?.name || 'Unknown',
            userEmail: inv.userId?.email,
            indexId: inv.indexId?._id,
            indexName: inv.indexId?.name || 'Unknown',
            indexColor: inv.indexId?.color,
            amount: inv.amount,
            totalReturns: inv.totalReturns, // Amount
            roi: inv.amount > 0 ? parseFloat(((inv.totalReturns / inv.amount) * 100).toFixed(2)) : 0, // Percentage
            status: inv.status,
            createdAt: inv.createdAt,
            weeklyReturns: inv.weeklyReturns
        }));

        return successResponse({
            investments: formattedInvestments,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            },
            stats
        }, 'Investments retrieved');

    } catch (error) {
        console.error('Admin get investments error:', error);
        return errorResponse('Failed to get investments', 500, error.message);
    }
}
