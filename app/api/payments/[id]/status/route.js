import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

// GET - Check payment request status
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const paymentRequest = await PaymentRequest.findOne({
            _id: id,
            userId: auth.user._id
        }).select('status requestId expiresAt');

        if (!paymentRequest) {
            return notFoundResponse('Payment request not found');
        }

        return successResponse({
            status: paymentRequest.status,
            requestId: paymentRequest.requestId,
            isExpired: paymentRequest.expiresAt < new Date() && paymentRequest.status === 'pending'
        });
    } catch (error) {
        console.error('Check payment status error:', error);
        return errorResponse('Failed to check payment status', 500, error.message);
    }
}
