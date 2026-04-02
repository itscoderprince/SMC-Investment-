import connectDB from '@/lib/db';
import User from '@/models/User';
import Referral from '@/models/Referral';
import { hashPassword, generateAccessToken, generateRefreshToken, generateEmailVerificationToken, validatePassword } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse, createdResponse } from '@/lib/response';
import { validateRequest, registerSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';


export async function POST(request) {
    try {
        // Check required env vars upfront
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not set');
            return errorResponse('Server configuration error: Database not configured', 500);
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set');
            return errorResponse('Server configuration error: JWT not configured', 500);
        }

        await connectDB();

        const body = await request.json();

        // Validate request body
        const validation = await validateRequest(registerSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { email, password, name, phone, referralCode } = validation.data;

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return errorResponse(passwordValidation.message, 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return errorResponse('This email is already registered. Please sign in instead.', 409);
            }
            if (existingUser.phone === phone) {
                return errorResponse('This phone number is already registered.', 409);
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Look up referrer if referral code provided
        let referrer = null;
        const cleanReferralCode = referralCode?.toString().trim().toUpperCase();
        if (cleanReferralCode) {
            referrer = await User.findOne({ referralCode: cleanReferralCode });
            if (!referrer) {
                // Don't fail registration if referral code is invalid — just ignore it
                console.warn(`Invalid referral code used during registration: ${cleanReferralCode}`);
            }
        }

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            phone,
            role: 'user',
            kycStatus: 'pending',
            isActive: true,
            isEmailVerified: false,
            referredBy: referrer ? referrer._id : null
        });

        // Generate tokens
        const accessToken = await generateAccessToken(user._id.toString(), user.role);
        const refreshToken = await generateRefreshToken(user._id.toString());

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Create referral record if referred
        if (referrer) {
            try {
                await Referral.create({
                    referrerId: referrer._id,
                    referredUserId: user._id,
                    status: 'pending'
                });
            } catch (refErr) {
                console.error('Failed to create referral record:', refErr);
                // Don't fail registration if referral record creation fails
            }
        }

        // Send emails (non-blocking, don't let email failures break registration)
        try {
            const { sendWelcomeEmail, sendVerificationEmail } = await import('@/lib/email');
            const emailToken = await generateEmailVerificationToken(user._id.toString(), user.email);
            Promise.all([
                sendWelcomeEmail(user),
                sendVerificationEmail(user, emailToken)
            ]).catch(err => console.error('Email send error (non-fatal):', err));
        } catch (emailImportErr) {
            console.error('Email module error (non-fatal):', emailImportErr);
        }

        // Log activity (non-blocking)
        try {
            ActivityLog.log({
                userId: user._id,
                action: 'register',
                description: 'User registered successfully',
                ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown'
            });
        } catch (logErr) {
            console.error('Activity log error (non-fatal):', logErr);
        }

        // Return response
        return createdResponse({
            user: user.toSafeObject(),
            accessToken,
            refreshToken
        }, 'Registration successful');

    } catch (error) {
        console.error('Registration error:', error?.message, error?.stack);

        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            const friendlyField = field === 'email' ? 'Email' : field === 'phone' ? 'Phone number' : field;
            return errorResponse(`${friendlyField} already exists. Please use a different one.`, 409);
        }

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message).join(', ');
            return errorResponse(messages, 400);
        }

        // Return the actual error message for debugging
        return errorResponse(error.message || 'Registration failed', 500);
    }
}
