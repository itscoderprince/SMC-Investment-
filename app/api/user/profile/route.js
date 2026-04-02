import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAuth } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, updateProfileSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

// GET - Get user profile
export async function GET(request) {
    try {
        await connectDB();

        const auth = await requireAuth(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;

        return successResponse({
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            kycStatus: user.kycStatus,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            bankDetails: user.bankDetails
        }, 'Profile retrieved successfully');

    } catch (error) {
        console.error('Get profile error:', error);
        return errorResponse('Failed to get profile', 500, error.message);
    }
}

// PUT - Update user profile
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
        const validation = await validateRequest(updateProfileSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { name, phone } = validation.data;

        // Check if phone is already taken
        if (phone && phone !== user.phone) {
            const existingUser = await User.findOne({ phone, _id: { $ne: user._id } });
            if (existingUser) {
                return errorResponse('Phone number already in use', 409);
            }
        }

        // Update user
        if (name) user.name = name;
        if (phone) user.phone = phone;
        await user.save();

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'profile_update',
            description: 'Profile updated',
            metadata: { updatedFields: Object.keys(validation.data) }
        });

        return successResponse({
            id: user._id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            kycStatus: user.kycStatus
        }, 'Profile updated successfully');

    } catch (error) {
        console.error('Update profile error:', error);
        return errorResponse('Failed to update profile', 500, error.message);
    }
}
