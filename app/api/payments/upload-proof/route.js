import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, uploadPaymentProofSchema } from '@/lib/validation';
import { uploadPaymentProof } from '@/lib/upload';
import ActivityLog from '@/models/ActivityLog';

export async function POST(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Parse form data
        const formData = await request.formData();
        const paymentRequestId = formData.get('paymentRequestId');
        const transactionReference = formData.get('transactionReference');
        const proofFile = formData.get('proofDocument');

        // Validate text fields
        const validation = await validateRequest(uploadPaymentProofSchema, {
            paymentRequestId,
            transactionReference
        });

        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        // Find payment request
        const paymentRequest = await PaymentRequest.findOne({
            _id: paymentRequestId,
            userId: user._id
        });

        if (!paymentRequest) {
            return errorResponse('Payment request not found', 404);
        }

        if (paymentRequest.status !== 'pending' && paymentRequest.status !== 'initialized') {
            return errorResponse('Payment proof can only be uploaded for pending requests', 400);
        }

        if (paymentRequest.isExpired) {
            paymentRequest.status = 'expired';
            await paymentRequest.save();
            return errorResponse('Payment request has expired', 400);
        }

        // Upload proof document
        if (!proofFile) {
            return errorResponse('Payment proof document is required', 400);
        }

        const uploadResult = await uploadPaymentProof(proofFile);
        if (!uploadResult.success) {
            return errorResponse(`Upload failed: ${uploadResult.error}`, 400);
        }

        // Update payment request
        await paymentRequest.uploadProof(uploadResult.url, transactionReference);

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'payment_proof_upload',
            description: 'Payment proof uploaded',
            targetId: paymentRequest._id,
            targetType: 'PaymentRequest'
        });

        return successResponse({
            id: paymentRequest._id,
            requestId: paymentRequest.requestId,
            status: paymentRequest.status,
            paymentProof: paymentRequest.paymentProof,
            transactionReference: paymentRequest.transactionReference
        }, 'Payment proof uploaded successfully');

    } catch (error) {
        console.error('Upload payment proof error:', error);
        return errorResponse('Failed to upload payment proof', 500, error.message);
    }
}
