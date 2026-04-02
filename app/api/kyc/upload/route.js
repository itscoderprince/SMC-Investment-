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

        // Check if KYC already approved
        if (user.kycStatus === 'approved') {
            return errorResponse('KYC already approved', 400);
        }

        // Check if KYC already submitted and pending
        const existingKYC = await KYC.findOne({ userId: user._id });
        if (existingKYC && existingKYC.status === 'pending') {
            return errorResponse('KYC already submitted and pending review', 400);
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

        // Create or update KYC
        let kyc;
        if (existingKYC) {
            // Update existing rejected KYC
            kyc = await existingKYC.resubmit(
                textValidation.data.documentType,
                textValidation.data.documentNumber,
                uploadResult.front.url,
                uploadResult.back.url
            );
        } else {
            // Create new KYC
            kyc = await KYC.create({
                userId: user._id,
                documentType: textValidation.data.documentType,
                documentNumber: textValidation.data.documentNumber,
                frontUrl: uploadResult.front.url,
                backUrl: uploadResult.back.url,
                status: 'pending'
            });

            // Update user KYC status
            user.kycStatus = 'submitted';
            await user.save();
        }

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: existingKYC ? 'kyc_resubmit' : 'kyc_submit',
            description: existingKYC ? 'KYC documents resubmitted' : 'KYC documents submitted',
            targetId: kyc._id,
            targetType: 'KYC'
        });

        return successResponse({
            id: kyc._id,
            status: kyc.status,
            submittedAt: kyc.submittedAt
        }, existingKYC ? 'KYC resubmitted successfully' : 'KYC submitted successfully');

    } catch (error) {
        console.error('KYC upload error:', error);
        return errorResponse('KYC upload failed', 500, error.message);
    }
}
