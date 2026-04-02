import { getUserFromRequest, verifyToken } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, errorResponse } from '@/lib/response';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Authenticate user from request
export async function requireAuth(request) {
    try {
        await connectDB();

        const payload = await getUserFromRequest(request);

        if (!payload) {
            return {
                success: false,
                response: unauthorizedResponse('Authentication required')
            };
        }

        // Get user from database
        const user = await User.findById(payload.userId);

        if (!user) {
            return {
                success: false,
                response: unauthorizedResponse('User not found')
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                response: forbiddenResponse('Account is deactivated')
            };
        }

        if (user.isLocked) {
            return {
                success: false,
                response: forbiddenResponse('Account is temporarily locked')
            };
        }

        return {
            success: true,
            user
        };
    } catch (error) {
        console.error('Auth middleware error:', error);
        return {
            success: false,
            response: errorResponse('Authentication error', 500)
        };
    }
}

// Require admin role
export async function requireAdmin(request) {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
        return authResult;
    }

    if (authResult.user.role !== 'admin' && authResult.user.role !== 'master_admin') {
        return {
            success: false,
            response: forbiddenResponse('Admin access required')
        };
    }

    return authResult;
}

// Require approved KYC
export async function requireKYC(request) {
    const authResult = await requireAuth(request);

    if (!authResult.success) {
        return authResult;
    }

    if (authResult.user.kycStatus !== 'approved') {
        return {
            success: false,
            response: forbiddenResponse('KYC verification required')
        };
    }

    return authResult;
}

// Get IP address from request
export function getClientIP(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return 'unknown';
}

// Get user agent from request
export function getUserAgent(request) {
    return request.headers.get('user-agent') || 'unknown';
}

// Optional auth - doesn't fail if not authenticated
export async function optionalAuth(request) {
    try {
        await connectDB();

        const payload = await getUserFromRequest(request);

        if (!payload) {
            return { success: true, user: null };
        }

        const user = await User.findById(payload.userId);

        return {
            success: true,
            user: user && user.isActive ? user : null
        };
    } catch (error) {
        return { success: true, user: null };
    }
}
