import connectDB from '@/lib/db';
import PaymentRequest from '@/models/PaymentRequest';
import Index from '@/models/Index';
import { generateId } from '@/lib/id';
import { requireKYC } from '@/lib/middleware/auth';
import { successResponse, errorResponse, validationErrorResponse, createdResponse } from '@/lib/response';
import { validateRequest, createPaymentRequestSchema } from '@/lib/validation';
import { sendPaymentConfirmationEmail } from '@/lib/email';
import ActivityLog from '@/models/ActivityLog';
import PlatformSettings from '@/models/PlatformSettings';

export const dynamic = 'force-dynamic';

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
        const validation = await validateRequest(createPaymentRequestSchema, body);
        if (!validation.success) {
            return validationErrorResponse(validation.errors);
        }

        const { indexId, amount, paymentMethod } = validation.data;

        // Find index
        const index = await Index.findById(indexId);
        if (!index) {
            return errorResponse('Investment index not found', 404);
        }
        if (!index.isActive) {
            return errorResponse('This investment index is not active', 400);
        }

        // Check investment limits
        if (amount < index.minInvestment) {
            return errorResponse(`Minimum investment for this index is $${index.minInvestment.toLocaleString()}`, 400);
        }
        if (amount > index.maxInvestment) {
            return errorResponse(`Maximum investment for this index is $${index.maxInvestment.toLocaleString()}`, 400);
        }

        // Check for existing pending payment request that has proof uploaded
        const blockingRequest = await PaymentRequest.findOne({
            userId: user._id,
            status: 'proof_uploaded'
        });

        if (blockingRequest) {
            return errorResponse('You have a pending payment verification. Please wait for it to be processed.', 400);
        }

        // Automatically expire any "ghost" pending requests (without proof) for this user
        await PaymentRequest.updateMany(
            {
                userId: user._id,
                status: 'pending'
            },
            {
                $set: { status: 'expired' }
            }
        );

        // Create payment request
        const requestId = generateId('PAY', 8);

        const paymentRequest = await PaymentRequest.create({
            userId: user._id,
            indexId: index._id,
            amount,
            paymentMethod: paymentMethod || 'bep20_usdt',
            duration: body.duration || 'flexible',
            requestId,
            status: 'initialized',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        // Get payment details from dynamic settings
        let paymentAddresses = {};
        try {
            paymentAddresses = await PlatformSettings.getPaymentAddresses();
        } catch (settingsError) {
            console.error('⚠️ Failed to load payment settings:', settingsError.message);
            // Fallback handled by the static method itself
            paymentAddresses = {
                usdt_bep20_address: '0x1234567890abcdef1234567890abcdef12345678',
                usdt_trc20_address: 'TAbcdef1234567890abcdef1234567890a'
            };
        }

        // Send confirmation email
        sendPaymentConfirmationEmail(user, paymentRequest).catch(err => {
            console.error('❌ Failed to send payment confirmation email:', err.message);
        });

        // Log activity
        ActivityLog.log({
            userId: user._id,
            action: 'payment_request',
            description: `Payment request created for $${amount}`,
            targetId: paymentRequest._id,
            targetType: 'PaymentRequest',
            metadata: { amount, indexId }
        });

        return createdResponse({
            id: paymentRequest._id,
            requestId: paymentRequest.requestId,
            amount: paymentRequest.amount,
            status: paymentRequest.status,
            expiresAt: paymentRequest.expiresAt,
            paymentDetails: {
                paymentMethod: paymentRequest.paymentMethod,
                network: paymentRequest.paymentMethod === 'bep20_usdt' ? 'BEP20' : 'TRC20',
                walletAddress: paymentRequest.paymentMethod === 'bep20_usdt'
                    ? (paymentAddresses.usdt_bep20_address)
                    : (paymentAddresses.usdt_trc20_address),
                amount: paymentRequest.amount
            },
            index: {
                id: index._id,
                name: index.name
            }
        }, 'Payment request created successfully');

    } catch (error) {
        console.error('Create payment request error:', error);
        return errorResponse('Failed to create payment request', 500, error.message);
    }
}
