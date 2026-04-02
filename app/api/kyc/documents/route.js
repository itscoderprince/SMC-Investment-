import connectDB from '@/lib/db';
import KYC from '@/models/KYC';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/response';

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
            return notFoundResponse('No KYC documents found');
        }

        // Return document URLs and masked numbers
        return successResponse({
            aadhar: {
                number: 'XXXX-XXXX-' + kyc.aadharNumber.slice(-4),
                documentUrl: kyc.aadharUrl
            },
            pan: {
                number: kyc.panNumber.slice(0, 2) + 'XXX' + kyc.panNumber.slice(-2),
                documentUrl: kyc.panUrl
            },
            status: kyc.status,
            submittedAt: kyc.submittedAt,
            verifiedAt: kyc.verifiedAt
        }, 'Documents retrieved');

    } catch (error) {
        console.error('KYC documents error:', error);
        return errorResponse('Failed to get documents', 500, error.message);
    }
}
