import connectDB from '@/lib/db';
import Investment from '@/models/Investment';
import Index from '@/models/Index'; // Ensure registered for populate
import User from '@/models/User'; // Ensure registered
import { requireAuth, requireKYC } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

// GET - Get user's investments
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
        const status = searchParams.get('status');

        // Build query
        const query = { userId: user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get total count
        const total = await Investment.countDocuments(query);
        console.log('Investments API: Query', query, 'Total', total);

        // Get investments
        const investments = await Investment.find(query)
            .populate('indexId', 'name slug color currentReturnRate')
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            investments: investments.map(inv => ({
                id: inv._id.toString(),
                _id: inv._id.toString(),
                amount: inv.amount,
                totalReturns: inv.totalReturns,
                totalValue: inv.amount + inv.totalReturns,
                roi: inv.amount > 0 ? ((inv.totalReturns / inv.amount) * 100).toFixed(2) : 0,
                isActive: inv.isActive,
                status: inv.status,
                activatedAt: inv.activatedAt,
                createdAt: inv.createdAt,
                weeksActive: inv.activatedAt ? Math.floor((Date.now() - new Date(inv.activatedAt)) / (7 * 24 * 60 * 60 * 1000)) : 0,
                index: inv.indexId ? {
                    id: inv.indexId._id,
                    name: inv.indexId.name,
                    slug: inv.indexId.slug,
                    color: inv.indexId.color,
                    currentReturnRate: inv.indexId.currentReturnRate
                } : { name: 'Legacy Index' }
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Investments retrieved');

    } catch (error) {
        console.error('Get investments error:', error);
        return errorResponse('Failed to get investments', 500, error.message);
    }
}
