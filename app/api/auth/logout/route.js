import connectDB from '@/lib/db';
import User from '@/models/User';
import { optionalAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/response';
import ActivityLog from '@/models/ActivityLog';

export async function POST(request) {
    try {
        await connectDB();

        // Optional authentication - allow logout even if token expired
        const auth = await optionalAuth(request);
        const user = auth.user;

        if (user) {
            // Clear refresh token in DB if user is found
            await User.findByIdAndUpdate(user._id, {
                $unset: { refreshToken: 1 }
            });

            // Log activity
            ActivityLog.log({
                userId: user._id,
                action: 'logout',
                description: 'User logged out',
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            });
        }

        return successResponse(null, 'Logged out successfully');

    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse('Logout failed', 500, error.message);
    }
}
