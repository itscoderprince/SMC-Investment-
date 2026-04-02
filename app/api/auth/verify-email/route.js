import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyEmailToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return errorResponse('Verification token is required', 400);
        }

        // Verify token
        const payload = await verifyEmailToken(token);

        if (!payload) {
            return errorResponse('Invalid or expired verification token', 400);
        }

        // Find user
        const user = await User.findById(payload.userId);

        if (!user) {
            return errorResponse('User not found', 404);
        }

        if (user.isEmailVerified) {
            return successResponse({ alreadyVerified: true }, 'Email already verified');
        }

        // Update user
        user.isEmailVerified = true;
        await user.save();

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'email_verify',
            description: 'Email verified successfully'
        });

        return successResponse({
            email: user.email,
            verified: true
        }, 'Email verified successfully');

    } catch (error) {
        console.error('Email verification error:', error);
        return errorResponse('Email verification failed', 500, error.message);
    }
}
