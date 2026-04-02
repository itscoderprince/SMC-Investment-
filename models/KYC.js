import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        documentType: {
            type: String,
            required: [true, 'Document type is required']
        },
        documentNumber: {
            type: String,
            required: [true, 'Document number is required']
        },
        frontUrl: {
            type: String,
            required: [true, 'Front document photo is required']
        },
        backUrl: {
            type: String,
            required: [true, 'Back document photo is required']
        },
        aadharNumber: {
            type: String,
        },
        aadharUrl: {
            type: String,
        },
        panNumber: {
            type: String,
            uppercase: true
        },
        panUrl: {
            type: String,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        rejectionReason: {
            type: String
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: {
            type: Date
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        resubmissionCount: {
            type: Number,
            default: 0
        },
        notes: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Indexes
kycSchema.index({ userId: 1 }, { unique: true });
kycSchema.index({ status: 1 });
kycSchema.index({ createdAt: -1 });
kycSchema.index({ verifiedAt: -1 });

// Virtual to populate user
kycSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

// Method to approve KYC
kycSchema.methods.approve = async function (adminId) {
    const User = mongoose.model('User');

    // Update KYC status
    this.status = 'approved';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    this.rejectionReason = undefined;
    await this.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(this.userId, {
        kycStatus: 'approved'
    });

    return this;
};

// Method to reject KYC
kycSchema.methods.reject = async function (adminId, reason) {
    const User = mongoose.model('User');

    // Update KYC status
    this.status = 'rejected';
    this.verifiedBy = adminId;
    this.verifiedAt = new Date();
    this.rejectionReason = reason;
    await this.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(this.userId, {
        kycStatus: 'rejected'
    });

    return this;
};

// Method to resubmit KYC
kycSchema.methods.resubmit = async function (documentType, documentNumber, frontUrl, backUrl) {
    const User = mongoose.model('User');

    this.documentType = documentType;
    this.documentNumber = documentNumber;
    this.frontUrl = frontUrl;
    this.backUrl = backUrl;
    this.status = 'pending';
    this.rejectionReason = undefined;
    this.verifiedBy = undefined;
    this.verifiedAt = undefined;
    this.submittedAt = new Date();
    this.resubmissionCount += 1;
    await this.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(this.userId, {
        kycStatus: 'submitted'
    });

    return this;
};

// Static to get pending KYC count
kycSchema.statics.getPendingCount = function () {
    return this.countDocuments({ status: 'pending' });
};

// Hide sensitive data
kycSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    // Mask Document number (show only last 4 digits)
    if (obj.documentNumber) {
        obj.documentNumberMasked = 'XXXX-XXXX-' + obj.documentNumber.slice(-4);
    }
    return obj;
};

// Force model re-registration in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.KYC;
}

export default mongoose.models.KYC || mongoose.model('KYC', kycSchema);
