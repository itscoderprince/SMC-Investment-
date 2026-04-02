import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import Index from '@/models/Index'; // Ensure registered for populate
import User from '@/models/User'; // Ensure registered for populate
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import { parsePagination } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        await connectDB();
        console.log('Admin Payments API: DB Connected');

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const { searchParams } = new URL(request.url);
        const pagination = parsePagination(searchParams);
        const status = searchParams.get('status');

        // Build query
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        } else {
            // By default, hide 'initialized' requests (drafts without proof)
            query.status = { $ne: 'initialized' };
        }

        // Get total count
        const total = await PaymentRequest.countDocuments(query);
        console.log('Admin Payments API: Query', query, 'Total', total);

        // Get payment requests
        const requests = await PaymentRequest.find(query)
            .populate('userId', 'name email phone')
            .populate('indexId', 'name slug')
            .sort({ createdAt: -1 })
            .skip((pagination.page - 1) * pagination.limit)
            .limit(pagination.limit)
            .lean();

        return successResponse({
            payments: requests.map(r => ({
                id: r._id,
                _id: r._id,
                requestId: r.requestId,
                amount: r.amount,
                status: r.status,
                paymentMethod: r.paymentMethod,
                paymentProof: r.paymentProof,
                transactionReference: r.transactionReference,
                user: r.userId ? {
                    id: r.userId._id,
                    name: r.userId.name,
                    email: r.userId.email
                } : null,
                index: r.indexId ? {
                    id: r.indexId._id,
                    name: r.indexId.name
                } : null,
                createdAt: r.createdAt,
                expiresAt: r.expiresAt
            })),
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit)
            }
        }, 'Payment requests retrieved');

    } catch (error) {
        console.error('Admin get payments error:', error);
        return errorResponse('Failed to get payment requests', 500, error.message);
    }
}
