import connectDB from '@/lib/db';
import User from '@/models/User';
import { verifyToken, generateAccessToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request) {
    try {
        await connectDB();

        let body;
        try {
            body = await request.json();
        } catch (e) {
            return errorResponse('Invalid JSON body', 400);
        }
        const { refreshToken } = body || {};

        if (!refreshToken) {
            return errorResponse('Refresh token is required', 400);
        }

        // Verify refresh token
        const payload = await verifyToken(refreshToken);

        if (!payload || payload.type !== 'refresh') {
            return errorResponse('Invalid refresh token', 401);
        }

        // Find user with matching refresh token
        const user = await User.findById(payload.userId).select('+refreshToken');

        if (!user) {
            return errorResponse('User not found', 401);
        }

        if (user.refreshToken !== refreshToken) {
            return errorResponse('Refresh token mismatch', 401);
        }

        if (!user.isActive) {
            return errorResponse('Account is deactivated', 403);
        }

        // Generate new access token
        const accessToken = await generateAccessToken(user._id.toString(), user.role);

        return successResponse({
            accessToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }, 'Token refreshed successfully');

    } catch (error) {
        console.error('Token refresh error:', error);
        return errorResponse('Token refresh failed', 500, error.message);
    }
}
