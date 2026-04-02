import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

// GET - Get investment history
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

        // Get all investments including inactive
        const total = await Investment.countDocuments({ userId: user._id });

        const investments = await Investment.find({ userId: user._id })
            .populate('indexId', 'name slug')
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            investments: investments.map(inv => ({
                id: inv._id,
                amount: inv.amount,
                totalReturns: inv.totalReturns,
                status: inv.status,
                isActive: inv.isActive,
                activatedAt: inv.activatedAt,
                createdAt: inv.createdAt,
                index: inv.indexId ? {
                    id: inv.indexId._id,
                    name: inv.indexId.name,
                    slug: inv.indexId.slug
                } : null
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Investment history retrieved');

    } catch (error) {
        console.error('Get investment history error:', error);
        return errorResponse('Failed to get investment history', 500, error.message);
    }
}
