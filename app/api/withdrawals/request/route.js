import connectDB from '@/lib/db';
import Withdrawal from '@/models/Withdrawal';
import Investment from '@/models/Investment';
import { generateId } from '@/lib/id';
import { requireKYC } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse, createdResponse } from '@/lib/response';
import { validateRequest, createWithdrawalSchema } from '@/lib/validation';
import { sendWithdrawalRequestEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';
import PlatformSettings from '@/models/PlatformSettings';

export async function POST(request) {
    try {
        await connectDB();

        // Require KYC approved
        const auth = await requireKYC(request);
        if (!auth.success) {
            return auth.response;
        }

        const { user } = auth;
        const body = await request.json();

        // Validate request
        const validation = await validateRequest(createWithdrawalSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { amount, method = 'crypto', bankDetails, cryptoDetails } = validation.data;

        // Get platform settings
        const settings = await PlatformSettings.getByCategory('payment');
        const minWithdrawal = settings.minWithdrawal || 20;
        const maxWithdrawal = settings.maxWithdrawal || 100000;

        // Check withdrawal limits
        if (amount < minWithdrawal) {
            return errorResponse(`Minimum withdrawal is $${minWithdrawal.toLocaleString()}`, 400);
        }
        if (amount > maxWithdrawal) {
            return errorResponse(`Maximum withdrawal is $${maxWithdrawal.toLocaleString()}`, 400);
        }

        // Validate method-specific details
        if (method === 'bank' && !bankDetails) {
            return errorResponse('Bank details are required for bank transfer', 400);
        }
        if (method === 'crypto' && !cryptoDetails) {
            return errorResponse('Crypto details are required for crypto withdrawal', 400);
        }

        // Get user's available balance (lifetime returns + bonus + referral bonus - lifetime withdrawals)
        const totalLifetimeReturns = await Investment.getUserTotalReturns(user._id);
        const bonus = user.accumulationBonus || 0;
        const referralBonus = user.referralBonusEarned || 0;
        const totalWithdrawn = await Withdrawal.getUserTotalWithdrawn(user._id);
        const availableBalance = totalLifetimeReturns + bonus + referralBonus - totalWithdrawn;

        if (amount > availableBalance) {
            return errorResponse(`Insufficient balance. You can only withdraw your profits and referral earnings. Available: $${Math.max(0, availableBalance).toLocaleString()}`, 400);
        }

        // Prepare withdrawal data
        const requestId = generateId('WTH', 8);
        const processingFee = settings.withdrawalFee || 0;
        const netAmount = amount - processingFee;

        const withdrawalData = {
            userId: user._id,
            amount,
            requestId,
            netAmount,
            method,
            processingFee
        };

        if (method === 'bank') {
            withdrawalData.bankDetails = {
                accountHolder: bankDetails.accountHolder,
                accountNumber: bankDetails.accountNumber,
                ifscCode: bankDetails.ifscCode.toUpperCase(),
                bankName: bankDetails.bankName
            };
        } else {
            withdrawalData.cryptoDetails = {
                address: cryptoDetails.address,
                network: cryptoDetails.network
            };
        }

        // Create withdrawal request
        const withdrawal = await Withdrawal.create(withdrawalData);

        // Save details to user profile for future use
        if (method === 'bank') {
            await (await import('@/models/User')).default.findByIdAndUpdate(user._id, {
                bankDetails: withdrawalData.bankDetails
            });
        } else {
            await (await import('@/models/User')).default.findByIdAndUpdate(user._id, {
                cryptoDetails: withdrawalData.cryptoDetails
            });
        }

        // Send confirmation email
        sendWithdrawalRequestEmail(user, withdrawal).catch(console.error);

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'withdrawal_request',
            description: `Withdrawal request created for $${amount} via ${method}`,
            targetId: withdrawal._id,
            targetType: 'Withdrawal',
            metadata: { amount, method }
        });

        return createdResponse({
            id: withdrawal._id,
            requestId: withdrawal.requestId,
            amount: withdrawal.amount,
            netAmount: withdrawal.netAmount,
            processingFee: withdrawal.processingFee,
            status: withdrawal.status,
            method: withdrawal.method,
            bankDetails: withdrawal.bankDetails,
            cryptoDetails: withdrawal.cryptoDetails,
            createdAt: withdrawal.createdAt
        }, 'Withdrawal request created successfully');

    } catch (error) {
        console.error('Create withdrawal error:', error);
        return errorResponse('Failed to create withdrawal request', 500, error.message);
    }
}
