import connectDB from '@/lib/db';
import User from '@/models/User';
import { generatePasswordResetToken, verifyPasswordResetToken, hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, forgotPasswordSchema, resetPasswordSchema } from '@/lib/validation';
import { sendPasswordResetEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';

// POST - Request password reset
export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        // Check if this is a reset request or forgot request
        if (body.token) {
            // This is a reset password request
            return await resetPassword(body, request);
        }

        // Validate request body
        const validation = await validateRequest(forgotPasswordSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { email } = validation.data;

        // Find user
        const user = await User.findOne({ email });

        // Always return success to prevent email enumeration
        if (!user) {
            return successResponse(null, 'If the email exists, a password reset link has been sent');
        }

        if (!user.isActive) {
            return successResponse(null, 'If the email exists, a password reset link has been sent');
        }

        // Generate reset token
        const resetToken = await generatePasswordResetToken(user._id.toString(), user.email);

        // Send reset email
        console.log(`📧 Dispatching password reset to: ${user.email}`);
        const emailResult = await sendPasswordResetEmail(user, resetToken);

        if (!emailResult.success) {
            console.error(`❌ Failed to send password reset email to ${user.email}:`, emailResult.error);
            // We still return success to the client to avoid enumeration, but log the error server-side
        } else {
            console.log(`✅ Password reset email dispatched for: ${user.email}`);
        }

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'password_reset',
            description: 'Password reset requested',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return successResponse(null, 'If that email is in our system, you will receive a reset link shortly.');

    } catch (error) {
        console.error('Forgot password error:', error);
        return errorResponse('Failed to process request', 500, error.message);
    }
}

// Reset password with token
async function resetPassword(body, request) {
    try {
        await connectDB();

        // Validate reset request
        const validation = await validateRequest(resetPasswordSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { token, password } = validation.data;

        // Verify token
        const payload = await verifyPasswordResetToken(token);

        if (!payload) {
            return errorResponse('Invalid or expired reset token. Please request a new password reset link.', 400);
        }

        // Find user — must select +password to avoid partial-save validation errors
        const user = await User.findById(payload.userId).select('+password');

        if (!user) {
            return errorResponse('User not found', 404);
        }

        if (!user.isActive) {
            return errorResponse('Account is inactive. Please contact support.', 403);
        }

        // Check token was not issued before last password change (replay protection)
        if (user.passwordChangedAt) {
            const tokenIssuedAt = payload.iat * 1000; // convert seconds to ms
            if (tokenIssuedAt < new Date(user.passwordChangedAt).getTime()) {
                return errorResponse('This reset link has already been used. Please request a new one.', 400);
            }
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update password and record the change time to invalidate this token
        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedPassword,
                    passwordChangedAt: new Date(),
                    loginAttempts: 0  // reset any failed login lockout
                },
                $unset: { lockUntil: 1 }
            }
        );

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'password_change',
            description: 'Password reset successfully via email link',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return successResponse(null, 'Password reset successfully. You can now log in with your new password.');
    } catch (error) {
        console.error('Reset password error:', error);
        return errorResponse('Failed to reset password', 500, error.message);
    }
}
