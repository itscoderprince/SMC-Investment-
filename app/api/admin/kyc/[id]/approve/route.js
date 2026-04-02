import connectDB from '@/lib/db';
import KYC from '@/models/KYC';
import '@/models/User'; // Ensure User model is registered
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';
import { sendKYCApprovalEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';

// PUT/POST - Approve KYC
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const kyc = await KYC.findById(id).populate('userId');
        if (!kyc) {
            return notFoundResponse('KYC record not found');
        }

        if (kyc.status === 'approved') {
            return errorResponse('KYC is already approved', 400);
        }

        // Use model method to approve
        await kyc.approve(auth.user._id);

        // Send email (non-blocking)
        sendKYCApprovalEmail(kyc.userId).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_kyc_approve',
            description: `Approved KYC for user: ${kyc.userId.email}`,
            targetId: kyc._id,
            targetType: 'KYC'
        });

        return successResponse(kyc, 'KYC approved successfully');
    } catch (error) {
        console.error('Admin approve KYC error:', error);
        return errorResponse('Failed to approve KYC', 500, error.message);
    }
}

export async function POST(request, { params }) {
    return PUT(request, { params });
}
