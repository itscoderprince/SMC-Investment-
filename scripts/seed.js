import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const generateId = (prefix = 'ID', length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
};

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env.local parser to avoid 'dotenv' dependency
const loadEnv = () => {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
        console.log('📝 Loaded environment variables from .env.local');
    }
};

loadEnv();

import User from '../models/User.js';
import Index from '../models/Index.js';
import PlatformSettings from '../models/PlatformSettings.js';
import ActivityLog from '../models/ActivityLog.js';
import Ticket from '../models/Ticket.js';
import Investment from '../models/Investment.js';
import PaymentRequest from '../models/PaymentRequest.js';
import Withdrawal from '../models/Withdrawal.js';
import KYC from '../models/KYC.js';
import ReturnHistory from '../models/ReturnHistory.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
}

const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const seedData = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Clear existing data
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Index.deleteMany({});
        await PlatformSettings.deleteMany({});
        await ActivityLog.deleteMany({});
        await Ticket.deleteMany({});
        await Investment.deleteMany({});
        await PaymentRequest.deleteMany({});
        await Withdrawal.deleteMany({});
        await KYC.deleteMany({});
        await ReturnHistory.deleteMany({});

        // 2. Seed Platform Settings
        console.log('⚙️ Initializing Platform Settings...');
        await PlatformSettings.initDefaults();

        // 3. Seed Admin & Users
        console.log('👤 Seeding Users...');
        const hashedPassword = await bcrypt.hash('Password@123', 10);
        const masterAdminPassword = await bcrypt.hash(process.env.MASTER_ADMIN_PASSWORD || 'admin123', 10);

        const users = [
            {
                name: 'Master Admin',
                email: process.env.MASTER_ADMIN_EMAIL || 'admin@smc.com',
                password: masterAdminPassword,
                phone: '9999999999',
                role: 'master_admin',
                kycStatus: 'approved',
                isEmailVerified: true,
                isActive: true
            },
            {
                name: 'System Administrator',
                email: 'admin@smc-protocol.com',
                password: hashedPassword,
                phone: '9876543210',
                role: 'admin',
                kycStatus: 'approved',
                isEmailVerified: true,
                isActive: true
            },
            {
                name: 'John Doe',
                email: 'user@test.com',
                password: hashedPassword,
                phone: '9876543211',
                role: 'user',
                kycStatus: 'approved',
                isEmailVerified: true,
                isActive: true
            },
            {
                name: 'Jane Smith',
                email: 'investor@test.com',
                password: hashedPassword,
                phone: '9876543212',
                role: 'user',
                kycStatus: 'pending',
                isEmailVerified: true,
                isActive: true
            }
        ];

        const seededUsers = await User.insertMany(users);
        const adminUser = seededUsers.find(u => u.role === 'admin');
        const regularUser = seededUsers.find(u => u.role === 'user' && u.email === 'user@test.com');

        // 4. Seed Indices
        console.log('📈 Seeding Indices...');
        const indices = [
            {
                name: "Bratsk",
                description: "Baseline volatility protection using bank-to-bank settlement proofs and premium debt instruments.",
                currentReturnRate: 4.25,
                icon: "Shield",
                riskLevel: "low",
                category: "finance",
                minInvestment: 100,
                lockPeriod: "3 Years",
                color: "#3b82f6",
                sortOrder: 1,
                isActive: true
            },
            {
                name: "Eyik",
                description: "Aggressive growth mapping across emerging fintech nodes and high-frequency settlement pools.",
                currentReturnRate: 14.80,
                icon: "BarChart3",
                riskLevel: "high",
                category: "technology",
                minInvestment: 1000,
                lockPeriod: "2 Years",
                color: "#10b981",
                sortOrder: 2,
                isActive: true
            },
            {
                name: "Viliuisk",
                description: "Direct tracking of physical commodities using off-chain verification and audited storage logs.",
                currentReturnRate: 7.12,
                icon: "Activity",
                riskLevel: "medium",
                category: "energy",
                minInvestment: 4999,
                lockPeriod: "1 Year",
                color: "#f59e0b",
                sortOrder: 3,
                isActive: true
            },
            {
                name: "Kobyai",
                description: "Balanced algorithmic rebalancing across multiple indices to maximize consistent weekly dividends.",
                currentReturnRate: 6.40,
                icon: "PieChart",
                riskLevel: "medium",
                category: "other",
                minInvestment: 2499,
                lockPeriod: "1 Year",
                color: "#8b5cf6",
                sortOrder: 4,
                isActive: true
            }
        ];

        const indicesWithSlugs = indices.map(idx => ({
            ...idx,
            slug: generateSlug(idx.name)
        }));

        await Index.insertMany(indicesWithSlugs);

        // 5. Seed Activity Logs
        console.log('📝 Seeding Activity Logs...');
        const logs = [
            {
                userId: regularUser._id,
                action: 'login',
                description: 'User logged in successfully',
                status: 'success'
            },
            {
                userId: regularUser._id,
                action: 'profile_update',
                description: 'Updated phone number',
                status: 'success'
            },
            {
                userId: adminUser._id,
                action: 'login',
                description: 'Admin logged in successfully',
                status: 'success'
            }
        ];
        await ActivityLog.insertMany(logs);

        // 6. Seed Tickets
        console.log('🎫 Seeding Tickets...');
        const tickets = [
            {
                userId: regularUser._id,
                subject: 'Help with KYC',
                description: 'I am unable to upload my PAN card photo. It says file too large.',
                category: 'kyc',
                priority: 'medium',
                status: 'open'
            }
        ];
        await Ticket.insertMany(tickets);

        // 7. Seed KYC Records
        console.log('🆔 Seeding KYC Records...');
        const seededIndices = await Index.find({});
        const bratskIndex = seededIndices.find(i => i.name === 'Bratsk');
        const eyikIndex = seededIndices.find(i => i.name === 'Eyik');
        const viliuiskIndex = seededIndices.find(i => i.name === 'Viliuisk');

        const kycRecords = [
            {
                userId: regularUser._id,
                aadharNumber: '123456789012',
                aadharUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                panNumber: 'ABCDE1234F',
                panUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'approved',
                verifiedBy: adminUser._id,
                verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                aadharNumber: '987654321098',
                aadharUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                panNumber: 'FGHIJ5678K',
                panUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                status: 'pending'
            }
        ];
        await KYC.insertMany(kycRecords);

        // 8. Seed Investments
        console.log('💰 Seeding Investments...');
        const investments = [
            {
                userId: regularUser._id,
                indexId: bratskIndex._id,
                amount: 5000,
                totalReturns: 425,
                status: 'active',
                isActive: true,
                activatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                weeklyReturns: [
                    {
                        week: 1,
                        weekStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                        weekEnd: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000),
                        returnRate: 4.25,
                        returnAmount: 212.5,
                        creditedAt: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000)
                    },
                    {
                        week: 2,
                        weekStart: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000),
                        weekEnd: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000),
                        returnRate: 4.25,
                        returnAmount: 212.5,
                        creditedAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000)
                    }
                ]
            },
            {
                userId: regularUser._id,
                indexId: eyikIndex._id,
                amount: 10000,
                totalReturns: 1480,
                status: 'active',
                isActive: true,
                activatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                weeklyReturns: [
                    {
                        week: 1,
                        weekStart: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                        weekEnd: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
                        returnRate: 4.90,
                        returnAmount: 490,
                        creditedAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000)
                    }
                ]
            },
            {
                userId: regularUser._id,
                indexId: viliuiskIndex._id,
                amount: 7500,
                totalReturns: 534,
                status: 'active',
                isActive: true,
                activatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                indexId: bratskIndex._id,
                amount: 15000,
                totalReturns: 1275,
                status: 'active',
                isActive: true,
                activatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                indexId: eyikIndex._id,
                amount: 25000,
                totalReturns: 3700,
                status: 'active',
                isActive: true,
                activatedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)
            }
        ];
        const seededInvestments = await Investment.insertMany(investments);

        // 9. Seed Payment Requests
        console.log('💳 Seeding Payment Requests...');
        const paymentRequests = [
            {
                userId: regularUser._id,
                investmentId: seededInvestments[0]._id,
                indexId: bratskIndex._id,
                amount: 5000,
                paymentMethod: 'bep20_usdt',
                transactionReference: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                status: 'approved',
                paymentProof: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                verifiedBy: adminUser._id,
                verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                requestId: generateId('PAY', 10)
            },
            {
                userId: regularUser._id,
                investmentId: seededInvestments[1]._id,
                indexId: eyikIndex._id,
                amount: 10000,
                paymentMethod: 'trc20_usdt',
                transactionReference: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                status: 'approved',
                paymentProof: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                verifiedBy: adminUser._id,
                verifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                requestId: generateId('PAY', 10)
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                indexId: bratskIndex._id,
                amount: 15000,
                paymentMethod: 'bep20_usdt',
                transactionReference: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
                status: 'proof_uploaded',
                paymentProof: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                requestId: generateId('PAY', 10)
            },
            {
                userId: regularUser._id,
                indexId: viliuiskIndex._id,
                amount: 8000,
                paymentMethod: 'trc20_usdt',
                status: 'proof_uploaded',
                paymentProof: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
                requestId: generateId('PAY', 10)
            }
        ];
        await PaymentRequest.insertMany(paymentRequests);

        // 10. Seed Withdrawals
        console.log('🏦 Seeding Withdrawals...');
        const withdrawals = [
            {
                userId: regularUser._id,
                amount: 500,
                method: 'crypto',
                cryptoDetails: {
                    network: 'BEP20',
                    address: '0xabcdef1234567890abcdef1234567890abcdef12'
                },
                status: 'approved',
                processedBy: adminUser._id,
                processedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                transactionReference: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
                requestId: generateId('WTH', 8)
            },
            {
                userId: regularUser._id,
                amount: 1000,
                method: 'crypto',
                cryptoDetails: {
                    network: 'TRC20',
                    address: '0x1234567890abcdef1234567890abcdef12345678'
                },
                status: 'pending',
                requestId: generateId('WTH', 8)
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                amount: 2000,
                method: 'crypto',
                cryptoDetails: {
                    network: 'BEP20',
                    address: '0x87654321fedcba0987654321fedcba0987654321'
                },
                status: 'pending',
                requestId: generateId('WTH', 8)
            }
        ];
        await Withdrawal.insertMany(withdrawals);

        // 11. Seed Return History
        console.log('📊 Seeding Return History...');
        const returnHistories = [];

        // Group investments by index for weekly return distributions
        const investmentsByIndex = {};
        for (const investment of seededInvestments) {
            const indexId = investment.indexId.toString();
            if (!investmentsByIndex[indexId]) {
                investmentsByIndex[indexId] = [];
            }
            investmentsByIndex[indexId].push(investment);
        }

        // Create weekly return history records for each index
        for (const [indexId, investments] of Object.entries(investmentsByIndex)) {
            const currentIndex = seededIndices.find(i => i._id.toString() === indexId);
            const oldestInvestment = investments.reduce((oldest, inv) =>
                inv.activatedAt < oldest.activatedAt ? inv : oldest
            );
            const weeksElapsed = Math.floor((Date.now() - oldestInvestment.activatedAt.getTime()) / (7 * 24 * 60 * 60 * 1000));

            for (let week = 0; week < weeksElapsed; week++) {
                const weekStartDate = new Date(oldestInvestment.activatedAt.getTime() + week * 7 * 24 * 60 * 60 * 1000);
                const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

                // Calculate totals for this week
                let totalPrincipal = 0;
                let totalDistributed = 0;
                const details = [];
                const weeklyRate = currentIndex ? currentIndex.currentReturnRate : 4.0;

                for (const investment of investments) {
                    // Only include investments that were active during this week
                    if (investment.activatedAt <= weekStartDate) {
                        const returnAmount = (investment.amount * weeklyRate) / 100;
                        totalPrincipal += investment.amount;
                        totalDistributed += returnAmount;

                        details.push({
                            investmentId: investment._id,
                            userId: investment.userId,
                            amount: investment.amount,
                            returnAmount: returnAmount,
                            success: true
                        });
                    }
                }

                if (details.length > 0) {
                    returnHistories.push({
                        indexId: indexId,
                        weekStart: weekStartDate,
                        weekEnd: weekEndDate,
                        returnRate: weeklyRate,
                        totalInvestments: details.length,
                        totalPrincipal: totalPrincipal,
                        totalDistributed: totalDistributed,
                        investorCount: new Set(details.map(d => d.userId.toString())).size,
                        distributedBy: adminUser._id,
                        distributedAt: weekEndDate,
                        status: 'completed',
                        details: details
                    });
                }
            }
        }

        await ReturnHistory.insertMany(returnHistories);

        // 12. Update Activity Logs with more realistic data
        console.log('📝 Adding more Activity Logs...');
        const additionalLogs = [
            {
                userId: regularUser._id,
                action: 'investment_create',
                description: 'Created investment in Bratsk index',
                status: 'success',
                createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
            },
            {
                userId: regularUser._id,
                action: 'payment_approve',
                description: 'Payment request approved for $5,000',
                status: 'success',
                createdAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000)
            },
            {
                userId: regularUser._id,
                action: 'withdrawal_request',
                description: 'Requested withdrawal of $500',
                status: 'success',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                action: 'kyc_submit',
                description: 'Submitted KYC documents',
                status: 'pending',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            },
            {
                userId: seededUsers.find(u => u.email === 'investor@test.com')._id,
                action: 'payment_request',
                description: 'Payment request pending approval for $15,000',
                status: 'pending',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            }
        ];
        await ActivityLog.insertMany(additionalLogs);

        console.log('✨ Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
