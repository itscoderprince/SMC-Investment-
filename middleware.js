import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = [
    '/api/user',
    '/api/kyc',
    '/api/investments',
    '/api/payments',
    '/api/withdrawals',
    '/api/returns',
    '/api/tickets'
];

const adminRoutes = [
    '/api/admin'
];

const publicRoutes = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/verify-email',
    '/api/auth/refresh',
    '/api/indices'
];

export async function middleware(request) {
    const { pathname } = request.nextUrl;


    // Skip non-API routes
    if (!pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check if route requires protection
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdmin = adminRoutes.some(route => pathname.startsWith(route));

    if (isProtected || isAdmin) {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Authentication required',
                    error: 'No token provided'
                },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid or expired token',
                    error: 'Token verification failed'
                },
                { status: 401 }
            );
        }

        // Check admin access
        if (isAdmin && (payload.role !== 'admin' && payload.role !== 'master_admin')) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Admin access required',
                    error: 'Insufficient permissions'
                },
                { status: 403 }
            );
        }

        // Add user info to headers for route handlers
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId);
        requestHeaders.set('x-user-role', payload.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*'
    ]
};
