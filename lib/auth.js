import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        // In production this should always be set — log a warning
        console.error('⚠️  JWT_SECRET is not set in environment variables!');
        // Use a deterministic fallback so the app doesn't crash (tokens won't be portable across restarts)
        throw new Error('Server configuration error: JWT_SECRET is missing. Please set it in your environment variables.');
    }
    return new TextEncoder().encode(secret);
};

// Hash password
export async function hashPassword(password) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(rounds);
    return await bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Generate access token
export async function generateAccessToken(userId, role) {
    const expiresIn = process.env.JWT_ACCESS_EXPIRE || '7d';
    return await new SignJWT({ userId, role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getJwtSecret());
}

// Generate refresh token
export async function generateRefreshToken(userId) {
    const expiresIn = process.env.JWT_REFRESH_EXPIRE || '30d';
    return await new SignJWT({ userId, type: 'refresh' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(getJwtSecret());
}

// Verify token
export async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        return payload;
    } catch (error) {
        return null;
    }
}

// Get user from request
export async function getUserFromRequest(request) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);
        const payload = await verifyToken(token);

        if (!payload) {
            return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

// Validate password strength
export function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!hasUpperCase) {
        return { valid: false, message: 'Password must contain uppercase letter' };
    }
    if (!hasLowerCase) {
        return { valid: false, message: 'Password must contain lowercase letter' };
    }
    if (!hasNumbers) {
        return { valid: false, message: 'Password must contain a number' };
    }

    return { valid: true };
}

// Generate email verification token
export async function generateEmailVerificationToken(userId, email) {
    return await new SignJWT({ userId, email, type: 'email_verification' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getJwtSecret());
}

// Generate password reset token
export async function generatePasswordResetToken(userId, email) {
    return await new SignJWT({ userId, email, type: 'password_reset' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(getJwtSecret());
}

// Verify email verification token
export async function verifyEmailToken(token) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        if (payload.type !== 'email_verification') {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

// Verify password reset token
export async function verifyPasswordResetToken(token) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());
        if (payload.type !== 'password_reset') {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}
