// File updated to resolve stale build cache error
import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import Index from '@/models/Index'; // Ensure registered
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, kycRejectSchema } from '@/lib/validation';
import { sendPaymentRejectionEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';

// Using kycRejectSchema for reason validation as it fits the same pattern
const rejectSchema = kycRejectSchema;

// PUT/POST - Reject Payment
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(rejectSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const paymentRequest = await PaymentRequest.findById(id).populate('userId');
        if (!paymentRequest) {
            return notFoundResponse('Payment request not found');
        }

        // Use model method to reject
        await paymentRequest.reject(auth.user._id, validation.data.reason);

        // Send email (non-blocking)
        sendPaymentRejectionEmail(paymentRequest.userId, validation.data.reason).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'payment_reject',
            description: `Rejected payment for user: ${paymentRequest.userId.email}. Reason: ${validation.data.reason}`,
            targetId: paymentRequest._id,
            targetType: 'PaymentRequest'
        });

        return successResponse(paymentRequest, 'Payment rejected successfully');
    } catch (error) {
        console.error('Admin reject payment error:', error);
        return errorResponse('Failed to reject payment', 500, error.message);
    }
}

export async function POST(request, { params }) {
    return PUT(request, { params });
}
