import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware/auth';
import { hashPassword, comparePassword, validatePassword } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, changePasswordSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

export async function PUT(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;
        const body = await request.json();

        // Validate request body
        const validation = await validateRequest(changePasswordSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { currentPassword, newPassword } = validation.data;

        // Validate new password strength
        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.valid) {
            return errorResponse(passwordValidation.message, 400);
        }

        // Get user with password
        const userWithPassword = await User.findById(user._id).select('+password');

        // Verify current password
        const isPasswordValid = await comparePassword(currentPassword, userWithPassword.password);
        if (!isPasswordValid) {
            return errorResponse('Current password is incorrect', 400);
        }

        // Check if new password is same as current
        const isSamePassword = await comparePassword(newPassword, userWithPassword.password);
        if (isSamePassword) {
            return errorResponse('New password must be different from current password', 400);
        }

        // Hash and save new password
        const hashedPassword = await hashPassword(newPassword);
        userWithPassword.password = hashedPassword;
        await userWithPassword.save();

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'password_change',
            description: 'Password changed successfully',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return successResponse(null, 'Password changed successfully');

    } catch (error) {
        console.error('Change password error:', error);
        return errorResponse('Failed to change password', 500, error.message);
    }
}
