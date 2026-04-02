import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: [
                // Auth actions
                'login', 'logout', 'register', 'password_change', 'password_reset',
                'email_verify', 'account_lock', 'account_unlock',
                // Profile actions
                'profile_update', 'avatar_update',
                // KYC actions
                'kyc_submit', 'kyc_approve', 'kyc_reject', 'kyc_resubmit',
                // Investment actions
                'investment_create', 'investment_activate', 'investment_pause',
                // Payment actions
                'payment_request', 'payment_proof_upload', 'payment_approve', 'payment_reject',
                // Withdrawal actions
                'withdrawal_request', 'withdrawal_approve', 'withdrawal_reject', 'withdrawal_complete',
                // Ticket actions
                'ticket_create', 'ticket_reply', 'ticket_close',
                // Admin actions
                'admin_user_create', 'admin_user_update', 'admin_user_block',
                'admin_index_create', 'admin_index_update', 'admin_index_toggle',
                'admin_return_distribute', 'admin_settings_update',
                'admin_ticket_reply', 'admin_ticket_update',
                // Other
                'other'
            ]
        },
        description: {
            type: String
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        ipAddress: {
            type: String
        },
        userAgent: {
            type: String
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId
        },
        targetType: {
            type: String,
            enum: ['User', 'KYC', 'Index', 'Investment', 'PaymentRequest', 'Withdrawal', 'Ticket', 'Settings']
        },
        status: {
            type: String,
            enum: ['success', 'failure', 'pending'],
            default: 'success'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, action: 1 });
activityLogSchema.index({ targetId: 1, targetType: 1 });

// Virtual to populate user
activityLogSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Static to log activity
activityLogSchema.statics.log = async function (data) {
    try {
        return await this.create({
            userId: data.userId,
            action: data.action,
            description: data.description,
            metadata: data.metadata || {},
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            targetId: data.targetId,
            targetType: data.targetType,
            status: data.status || 'success'
        });
    } catch (error) {
        console.error('Activity log error:', error);
        return null;
    }
};

// Static to get user's recent activity
activityLogSchema.statics.getUserActivity = async function (userId, limit = 20) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static to cleanup old logs (keep last 90 days)
activityLogSchema.statics.cleanup = async function (daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.deleteMany({
        createdAt: { $lt: cutoffDate }
    });

    return result.deletedCount;
};

// Ensure model is registered correctly
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema, 'activity_logs');

export default ActivityLog;
