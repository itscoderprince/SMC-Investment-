import connectDB from '@/lib/db';
import KYC from '@/models/KYC';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, kycUploadSchema } from '@/lib/validation';
import { uploadGenericKYCDocuments } from '@/lib/upload';
import ActivityLog from '@/models/ActivityLog';

export async function POST(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        // Get existing KYC
        const existingKYC = await KYC.findOne({ userId: user._id });

        if (!existingKYC) {
            return errorResponse('No KYC submission found. Please submit KYC first.', 400);
        }

        if (existingKYC.status !== 'rejected') {
            return errorResponse('KYC can only be resubmitted if rejected', 400);
        }

        // Parse form data
        const formData = await request.formData();

        const documentType = formData.get('documentType');
        const documentNumber = formData.get('documentNumber');
        const frontFile = formData.get('frontDocument');
        const backFile = formData.get('backDocument');

        // Validate text fields
        const textValidation = await validateRequest(kycUploadSchema, {
            documentType: documentType?.trim(),
            documentNumber: documentNumber?.trim()?.toUpperCase()
        });

        if (!textValidation.success) {
            return validationErrorResponse(textValidation.errors);
        }

        // Upload documents
        const uploadResult = await uploadGenericKYCDocuments(frontFile, backFile);

        if (!uploadResult.success) {
            return errorResponse('Document upload failed', 400, uploadResult.errors);
        }

        // Resubmit KYC
        const kyc = await existingKYC.resubmit(
            textValidation.data.documentType,
            textValidation.data.documentNumber,
            uploadResult.front.url,
            uploadResult.back.url
        );

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'kyc_resubmit',
            description: 'KYC documents resubmitted after rejection',
            targetId: kyc._id,
            targetType: 'KYC'
        });

        return successResponse({
            id: kyc._id,
            status: kyc.status,
            submittedAt: kyc.submittedAt,
            resubmissionCount: kyc.resubmissionCount
        }, 'KYC resubmitted successfully');

    } catch (error) {
        console.error('KYC resubmit error:', error);
        return errorResponse('KYC resubmission failed', 500, error.message);
    }
}
