import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import Index from '@/models/Index'; // Ensure registered for populate
import User from '@/models/User'; // Ensure registered
import Investment from '@/models/Investment'; // Ensure registered
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
        const status = searchParams.get('status');

        // Build query
        const query = { userId: user._id };
        if (status && status !== 'all') {
            query.status = status;
        }

        // Get total count
        const total = await PaymentRequest.countDocuments(query);
        console.log('User Requests API: Query', query, 'Total', total);

        // Get payment requests
        const requests = await PaymentRequest.find(query)
            .populate('indexId', 'name slug')
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            requests: requests.map(req => ({
                id: req._id.toString(),
                _id: req._id.toString(),
                requestId: req.requestId,
                amount: req.amount,
                status: req.status,
                paymentMethod: req.paymentMethod,
                paymentProof: req.paymentProof,
                expiresAt: req.expiresAt,
                isExpired: req.expiresAt && new Date(req.expiresAt) < new Date() && req.status === 'pending',
                createdAt: req.createdAt,
                index: req.indexId ? {
                    id: req.indexId._id,
                    name: req.indexId.name,
                    slug: req.indexId.slug
                } : { name: 'Unknown Index' }
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Payment requests retrieved');

    } catch (error) {
        console.error('Get payment requests error:', error);
        return errorResponse('Failed to get payment requests', 500, error.message);
    }
}
