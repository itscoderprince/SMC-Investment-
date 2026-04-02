import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        category: {
            type: String,
            enum: ['general', 'investment', 'payment', 'email', 'security', 'maintenance'],
            default: 'general'
        },
        description: {
            type: String
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
platformSettingsSchema.index({ key: 1 }, { unique: true });
platformSettingsSchema.index({ category: 1 });

// Static to get setting by key
platformSettingsSchema.statics.get = async function (key, defaultValue = null) {
    const setting = await this.findOne({ key });
    return setting ? setting.value : defaultValue;
};

// Static to set setting
platformSettingsSchema.statics.set = async function (key, value, category = 'general', adminId = null) {
    return await this.findOneAndUpdate(
        { key },
        {
            value,
            category,
            updatedBy: adminId
        },
        { upsert: true, new: true }
    );
};

// Static to get all settings by category
platformSettingsSchema.statics.getByCategory = async function (category) {
    const settings = await this.find({ category });
    const result = {};
    settings.forEach(s => {
        result[s.key] = s.value;
    });
    return result;
};

// Static to specifically get payment addresses with fallbacks
platformSettingsSchema.statics.getPaymentAddresses = async function () {
    const settings = await this.find({
        key: { $in: ['usdt_bep20_address', 'usdt_trc20_address'] }
    });

    const result = {
        usdt_bep20_address: '0x1234567890abcdef1234567890abcdef12345678', // Default fallback
        usdt_trc20_address: 'TAbcdef1234567890abcdef1234567890a' // Default fallback
    };

    settings.forEach(s => {
        if (s.value && s.value.trim() !== '') {
            result[s.key] = s.value;
        }
    });

    return result;
};

// Static to get all settings as object
platformSettingsSchema.statics.getAll = async function () {
    const settings = await this.find({});
    const result = {};
    settings.forEach(s => {
        result[s.key] = s.value;
    });
    return result;
};

// Static to bulk update settings
platformSettingsSchema.statics.bulkUpdate = async function (settings, category, adminId) {
    const operations = Object.entries(settings).map(([key, value]) => ({
        updateOne: {
            filter: { key },
            update: {
                $set: {
                    value,
                    category,
                    updatedBy: adminId,
                    updatedAt: new Date()
                }
            },
            upsert: true
        }
    }));

    return await this.bulkWrite(operations);
};

// Static to initialize default settings
platformSettingsSchema.statics.initDefaults = async function () {
    const defaults = [
        // General
        { key: 'siteName', value: 'SMC Protocol', category: 'general', description: 'Site name' },
        { key: 'siteDescription', value: 'Your trusted investment platform', category: 'general' },
        { key: 'supportEmail', value: 'Smcruteam@gmail.com', category: 'general' },
        { key: 'supportPhone', value: '+91-9876543210', category: 'general' },

        // Investment
        { key: 'minInvestment', value: 100, category: 'investment', description: 'Minimum investment amount' },
        { key: 'maxInvestment', value: 1000000, category: 'investment', description: 'Maximum investment amount' },
        { key: 'minWeeklyReturn', value: 3, category: 'investment', description: 'Minimum weekly return %' },
        { key: 'maxWeeklyReturn', value: 5, category: 'investment', description: 'Maximum weekly return %' },

        // Withdrawal
        { key: 'minWithdrawal', value: 20, category: 'payment', description: 'Minimum withdrawal amount' },
        { key: 'maxWithdrawal', value: 100000, category: 'payment', description: 'Maximum withdrawal amount' },
        { key: 'withdrawalFee', value: 0, category: 'payment', description: 'Withdrawal processing fee' },

        // Payment
        { key: 'bankName', value: 'HDFC Bank', category: 'payment' },
        { key: 'bankAccountNumber', value: '1234567890', category: 'payment' },
        { key: 'bankIfsc', value: 'HDFC0001234', category: 'payment' },
        { key: 'bankAccountHolder', value: 'SMC Protocol', category: 'payment' },
        { key: 'upiId', value: 'smc@upi', category: 'payment' },
        { key: 'usdt_bep20_address', value: '0x1234567890abcdef1234567890abcdef12345678', category: 'payment', description: 'USDT BEP20 Wallet Address' },
        { key: 'usdt_trc20_address', value: 'TAbcdef1234567890abcdef1234567890a', category: 'payment', description: 'USDT TRC20 Wallet Address' },

        // Security
        { key: 'maxLoginAttempts', value: 5, category: 'security' },
        { key: 'lockoutDuration', value: 15, category: 'security', description: 'Account lockout duration (minutes)' },
        { key: 'sessionTimeout', value: 7, category: 'security', description: 'Session timeout (days)' },

        // Maintenance
        { key: 'maintenanceMode', value: false, category: 'maintenance' },
        { key: 'maintenanceMessage', value: 'We are currently performing scheduled maintenance.', category: 'maintenance' }
    ];

    for (const setting of defaults) {
        const exists = await this.findOne({ key: setting.key });
        if (!exists) {
            await this.create(setting);
        }
    }

    return { message: 'Default settings initialized' };
};

// Force model re-registration in development to pick up schema changes
if (process.env.NODE_ENV === 'development') {
    if (mongoose.models.PlatformSettings) {
        delete mongoose.models.PlatformSettings;
    }
}

export default mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', platformSettingsSchema, 'platform_settings');
