import connectDB from '@/lib/db';
import KYC from '@/models/KYC';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Get KYC record
        const kyc = await KYC.findOne({ userId: user._id });

        if (!kyc) {
            return successResponse({
                status: 'not_submitted',
                message: 'KYC not submitted yet'
            }, 'KYC status retrieved');
        }

        const response = {
            status: kyc.status,
            submittedAt: kyc.submittedAt,
            resubmissionCount: kyc.resubmissionCount
        };

        // Include rejection reason if rejected
        if (kyc.status === 'rejected') {
            response.rejectionReason = kyc.rejectionReason;
        }

        // Include verification date if approved
        if (kyc.status === 'approved') {
            response.verifiedAt = kyc.verifiedAt;
        }

        return successResponse(response, 'KYC status retrieved');

    } catch (error) {
        console.error('KYC status error:', error);
        return errorResponse('Failed to get KYC status', 500, error.message);
    }
}
