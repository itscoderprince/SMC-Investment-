import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, loginSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

export async function POST(request) {
    try {
        // Check required env vars upfront
        if (!process.env.MONGODB_URI) {
            return errorResponse('Server configuration error: Database not configured', 500);
        }
        if (!process.env.JWT_SECRET) {
            return errorResponse('Server configuration error: JWT not configured', 500);
        }

        await connectDB();

        const body = await request.json();

        // Validate request body
        const validation = await validateRequest(loginSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { email, password } = validation.data;

        // 1. Check if it's the master admin from environment
        const isMasterAdminEmail = email === process.env.MASTER_ADMIN_EMAIL;
        const isMasterAdminPassword = password === process.env.MASTER_ADMIN_PASSWORD;

        // 2. Find user
        let user = await User.findByEmailWithPassword(email);

        // 3. Fallback: If master admin not in DB but credentials match env, create/reset them
        if (isMasterAdminEmail && isMasterAdminPassword) {
            if (!user) {
                // Auto-create missing master admin
                user = await User.create({
                    name: 'Master Admin',
                    email: email,
                    password: await hashPassword(password),
                    phone: '9999999999',
                    role: 'master_admin',
                    kycStatus: 'approved',
                    isEmailVerified: true,
                    isActive: true
                });
                console.log('✅ Created missing Master Admin from env credentials');
            } else if (user.role !== 'master_admin' || !user.isActive) {
                // Ensure master admin has correct role and is active if credentials match env
                user.role = 'master_admin';
                user.isActive = true;
                await user.save();
                console.log('✅ Reset Master Admin role/status from env credentials');
            }
        }

        if (!user) {
            return errorResponse('Invalid email or password', 401);
        }

        // Check if account is locked (Bypass for admins)
        if (user.isLocked && user.role === 'user') {
            const lockRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return errorResponse(
                `Account is locked. Try again in ${lockRemaining} minutes`,
                423
            );
        }

        // Check if account is active
        if (!user.isActive) {
            return errorResponse('Account is deactivated. Contact support.', 403);
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            // Special case: if it matches MASTER_ADMIN_PASSWORD from env, we allow it
            if (isMasterAdminEmail && isMasterAdminPassword) {
                console.log('✅ Master Admin authenticated via ENV fallback');
            } else {
                // Increment failed login attempts
                await user.incrementLoginAttempts();

                // Log failed attempt
                ActivityLog.log({
                    userId: user._id,
                    action: 'login',
                    description: 'Failed login attempt',
                    status: 'failure',
                    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                    userAgent: request.headers.get('user-agent') || 'unknown'
                });

                return errorResponse('Invalid email or password', 401);
            }
        }

        // Reset login attempts on successful login
        await user.resetLoginAttempts();

        // Generate tokens
        const accessToken = await generateAccessToken(user._id.toString(), user.role);
        const refreshToken = await generateRefreshToken(user._id.toString());

        // Save refresh token
        await User.findByIdAndUpdate(user._id, {
            refreshToken,
            lastLogin: new Date()
        });

        // Log successful login
        ActivityLog.log({
            userId: user._id,
            action: 'login',
            description: 'User logged in successfully',
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
        });

        // Return response
        return successResponse({
            user: user.toSafeObject(),
            accessToken,
            refreshToken
        }, 'Login successful');


    } catch (error) {
        console.error('Login error:', error);
        // Return the actual error message so the user can see if it's a DB connection issue
        return errorResponse(error.message || 'Login failed', 500);
    }
}
