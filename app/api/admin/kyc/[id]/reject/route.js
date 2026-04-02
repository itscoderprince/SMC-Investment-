import connectDB from '@/lib/db';
import KYC from '@/models/KYC';
import '@/models/User'; // Ensure User model is registered
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, kycRejectSchema } from '@/lib/validation';
import { sendKYCRejectionEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';

// PUT/POST - Reject KYC
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(kycRejectSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const kyc = await KYC.findById(id).populate('userId');
        if (!kyc) {
            return notFoundResponse('KYC record not found');
        }

        // Use model method to reject
        await kyc.reject(auth.user._id, validation.data.reason);

        // Send email (non-blocking)
        sendKYCRejectionEmail(kyc.userId, validation.data.reason).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_kyc_reject',
            description: `Rejected KYC for user: ${kyc.userId.email}. Reason: ${validation.data.reason}`,
            targetId: kyc._id,
            targetType: 'KYC'
        });

        return successResponse(kyc, 'KYC rejected successfully');
    } catch (error) {
        console.error('Admin reject KYC error:', error);
        return errorResponse('Failed to reject KYC', 500, error.message);
    }
}

export async function POST(request, { params }) {
    return PUT(request, { params });
}
