import mongoose from 'mongoose';
import crypto from 'crypto';


const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 8,
            select: false // Don't return password by default
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: 2,
            maxlength: 100
        },
        phone: {
            type: String,
            required: [true, 'Phone is required'],
            unique: true,
            match: [/^\+?[\d\s\-]{7,20}$/, 'Invalid phone number format']
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'master_admin'],
            default: 'user'
        },
        kycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'approved', 'rejected'],
            default: 'pending'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        avatar: {
            type: String,
            default: null
        },
        lastLogin: {
            type: Date
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        bankDetails: {
            accountHolder: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String
        },
        cryptoDetails: {
            address: String,
            network: {
                type: String,
                enum: ['BEP20', 'TRC20']
            }
        },
        lockUntil: {
            type: Date
        },
        passwordChangedAt: {
            type: Date,
            default: null
        },
        refreshToken: {
            type: String,
            select: false
        },
        accumulationBonus: {
            type: Number,
            default: 0
        },
        // Referral system
        referralCode: {
            type: String,
            unique: true,
            sparse: true // allow null until generated
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        referralBonusEarned: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes (email and phone already indexed via unique: true)
userSchema.index({ kycStatus: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Auto-generate referral code before save if not set
// Auto-generate referral code before save if not set
userSchema.pre('save', async function () {
    if (!this.referralCode) {
        // Generate a short unique code: first 4 chars of name + 6 random hex chars
        const namePart = (this.name || 'USR').replace(/\s+/g, '').substring(0, 4).toUpperCase();
        const randPart = crypto.randomBytes(3).toString('hex').toUpperCase();
        this.referralCode = `${namePart}${randPart}`;
    }
});


// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name (in case we add first/last name later)
userSchema.virtual('displayName').get(function () {
    return this.name;
});

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
    // If previous lock has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 15 minutes (Only for regular users)
    if (this.role === 'user' && this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
    }

    return await this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function () {
    return await this.updateOne({
        $set: { loginAttempts: 0, lastLogin: new Date() },
        $unset: { lockUntil: 1 }
    });
};

// Check if user can invest (KYC approved and active)
userSchema.methods.canInvest = function () {
    return this.isActive && this.kycStatus === 'approved';
};

// Hide sensitive fields
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    delete obj.loginAttempts;
    delete obj.lockUntil;
    return obj;
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+password');
};

// Force model re-registration in development to pick up schema changes
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
