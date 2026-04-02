import connectDB from '@/lib/db';
import User from '@/models/User';
import { requireAdmin } from '@/lib/middleware/auth';
import { successResponse, errorResponse, notFoundResponse, validationErrorResponse } from '@/lib/response';
import { validateRequest, updateUserSchema } from '@/lib/validation';
import ActivityLog from '@/models/ActivityLog';

// GET - Get single user details (Admin)
export async function GET(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const user = await User.findById(id).select('-password -refreshToken');
        if (!user) {
            return notFoundResponse('User not found');
        }

        return successResponse(user);
    } catch (error) {
        console.error('Admin get user error:', error);
        return errorResponse('Failed to get user details', 500, error.message);
    }
}

// PUT - Update user (Admin)
export async function PUT(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const body = await request.json();
        const validation = await validateRequest(updateUserSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const user = await User.findById(id);
        if (!user) {
            return notFoundResponse('User not found');
        }

        // Apply updates
        Object.assign(user, validation.data);
        await user.save();

        // Log activity
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_user_update',
            description: `Updated user: ${user.email}`,
            targetId: user._id,
            targetType: 'User'
        });

        return successResponse(user, 'User updated successfully');
    } catch (error) {
        console.error('Admin update user error:', error);
        return errorResponse('Failed to update user', 500, error.message);
    }
}
// DELETE - Delete user and all related data (Admin)
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        const { id } = await params;

        const auth = await requireAdmin(request);
        if (!auth.success) {
            return auth.response;
        }

        const user = await User.findById(id);
        if (!user) {
            return notFoundResponse('User not found');
        }

        // Prevent deleting self
        if (user._id.toString() === auth.user._id.toString()) {
            return errorResponse('Cannot delete your own account', 400);
        }

        // Import other models to delete related data
        const Investment = (await import('@/models/Investment')).default;
        const KYC = (await import('@/models/KYC')).default;
        const PaymentRequest = (await import('@/models/PaymentRequest')).default;
        const Withdrawal = (await import('@/models/Withdrawal')).default;
        const Ticket = (await import('@/models/Ticket')).default;

        // Delete all related data
        await Promise.all([
            Investment.deleteMany({ userId: id }),
            KYC.deleteOne({ userId: id }),
            PaymentRequest.deleteMany({ userId: id }),
            Withdrawal.deleteMany({ userId: id }),
            Ticket.deleteMany({ userId: id }),
            ActivityLog.deleteMany({ userId: id })
        ]);

        // Delete user
        await User.findByIdAndDelete(id);

        // Log activity by admin
        ActivityLog.log({
            userId: auth.user._id,
            action: 'admin_user_delete',
            description: `Deleted user: ${user.email} and all related data`,
            targetId: id, // ID might not exist anymore but good for record
            targetType: 'User'
        });

        return successResponse(null, 'User and all associated data deleted successfully');
    } catch (error) {
        console.error('Admin delete user error:', error);
        return errorResponse('Failed to delete user', 500, error.message);
    }
}
