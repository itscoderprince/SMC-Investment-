import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;
        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const investmentId = searchParams.get('investmentId');

        // Get user's investments with returns
        let query = { userId: user._id, 'weeklyReturns.0': { $exists: true } };

        if (investmentId) {
            query._id = investmentId;
        }

        const investments = await Investment.find(query)
            .populate('indexId', 'name slug color')
            .select('amount weeklyReturns totalReturns indexId')
            .lean();

        // Flatten weekly returns
        let allReturns = [];
        for (const inv of investments) {
            for (const ret of inv.weeklyReturns) {
                allReturns.push({
                    investmentId: inv._id,
                    indexName: inv.indexId?.name,
                    indexColor: inv.indexId?.color,
                    principal: inv.amount,
                    week: ret.week,
                    weekStart: ret.weekStart,
                    weekEnd: ret.weekEnd,
                    returnRate: ret.returnRate,
                    returnAmount: ret.returnAmount,
                    creditedAt: ret.creditedAt
                });
            }
        }

        // Sort by credited date (most recent first)
        allReturns.sort((a, b) => new Date(b.creditedAt) - new Date(a.creditedAt));

        // Apply pagination
        const total = allReturns.length;
        const paginatedReturns = allReturns.slice(
            (pagination.page - 1) * pagination.limit,
            pagination.page * pagination.limit
        );

        // Calculate totals
        const totalReturns = allReturns.reduce((sum, r) => sum + r.returnAmount, 0);

        return successResponse({
            returns: paginatedReturns,
            summary: {
                totalEntries: total,
                totalReturns
            },
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Returns history retrieved');

    } catch (error) {
        console.error('Get returns error:', error);
        return errorResponse('Failed to get returns', 500, error.message);
    }
}
