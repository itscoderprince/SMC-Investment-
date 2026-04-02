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
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Match stage for aggregation
        let matchStage = {
            'weeklyReturns.0': { $exists: true } // Ensure has returns
        };

        if (search) {
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = users.map(u => u._id);

            matchStage.userId = { $in: userIds };
        }

        // Aggregate pipeline
        const pipeline = [
            { $match: matchStage },
            { $unwind: '$weeklyReturns' },
            // Populate lookups
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'indices',
                    localField: 'indexId',
                    foreignField: '_id',
                    as: 'index'
                }
            },
            { $unwind: '$index' },
            // Date filter on creditedAt
            ...(startDate || endDate ? [{
                $match: {
                    'weeklyReturns.creditedAt': {
                        ...(startDate ? { $gte: new Date(startDate) } : {}),
                        ...(endDate ? { $lte: new Date(endDate) } : {})
                    }
                }
            }] : []),
            // Sort
            { $sort: { 'weeklyReturns.creditedAt': -1 } },
            // Facet for pagination
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: (pagination.page - 1) * pagination.limit },
                        { $limit: pagination.limit },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                userId: '$user._id',
                                userName: '$user.name',
                                userEmail: '$user.email',
                                indexName: '$index.name',
                                indexColor: '$index.color',
                                amount: '$amount', // Principal
                                week: '$weeklyReturns.week',
                                returnRate: '$weeklyReturns.returnRate',
                                returnAmount: '$weeklyReturns.returnAmount',
                                creditedAt: '$weeklyReturns.creditedAt'
                            }
                        }
                    ]
                }
            }
        ];

        const result = await Investment.aggregate(pipeline);

        const data = result?.[0]?.data || [];
        const total = result?.[0]?.metadata?.[0]?.total || 0;

        // Calculate total returns distributed across ALL time (or filtered range)
        // This requires separate aggregation
        const totalStats = await Investment.aggregate([
            { $unwind: '$weeklyReturns' },
            ...(startDate || endDate ? [{
                $match: {
                    'weeklyReturns.creditedAt': {
                        ...(startDate ? { $gte: new Date(startDate) } : {}),
                        ...(endDate ? { $lte: new Date(endDate) } : {})
                    }
                }
            }] : []),
            {
                $group: {
                    _id: null,
                    totalDistributed: { $sum: '$weeklyReturns.returnAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        return successResponse({
            returns: data,
            stats: {
                totalDistributed: totalStats[0]?.totalDistributed || 0,
                totalCount: totalStats[0]?.count || 0
            },
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Returns history retrieved');

    } catch (error) {
        console.error('Admin get returns error:', error);
        return errorResponse('Failed to get returns', 500, error.message);
    }
}
