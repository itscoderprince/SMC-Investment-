import { Resend } from 'resend';

let resendClient = null;
const getResendClient = () => {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_resend_api_key' || apiKey === 're_123') {
    return null;
  }
  try {
    resendClient = new Resend(apiKey);
    return resendClient;
  } catch (error) {
    console.error('Failed to initialize Resend client:', error);
    return null;
  }
};

const FROM_EMAIL = process.env.EMAIL_FROM || 'SMC <noreply@smc-protocol.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const OWNER_EMAIL = 'cobestiven000@gmail.com'; // Resend account owner — always receives redirected dev emails

// Generic email sender
export async function sendEmail({ to, subject, html }) {
  try {
    // Skip sending if no API key (development)
    const resend = getResendClient();
    if (!resend) {
      console.log('📧 Email skipped (no valid API key):', { to, subject });
      return { success: true, data: { id: 'dev-mode' } };
    }

    console.log(`📤 Sending email to: ${to} | Subject: ${subject} | From: ${FROM_EMAIL}`);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html
    });

    if (error) {
      console.error('❌ Resend API error:', JSON.stringify(error));

      // Handle unverified recipient error (common in Resend Sandbox — only verified recipients can receive mail)
      if (
        error.message?.includes('not verified') ||
        error.message?.includes('not authorized') ||
        error.message?.includes('You can only send testing emails')
      ) {
        console.warn(`⚠️ Resend sandbox restriction: ${to} is not a verified recipient. Redirecting to owner ${OWNER_EMAIL}...`);

        const fallback = await resend.emails.send({
          from: FROM_EMAIL,
          to: OWNER_EMAIL,
          subject: `[DEV → ${to}] ${subject}`,
          html: `
            <div style="background: #fff3cd; padding: 12px 16px; border: 1px solid #ffc107; border-radius: 6px; margin-bottom: 20px; font-family: sans-serif;">
              <strong>🧪 Developer Redirect Notice</strong><br>
              This email was originally intended for <strong>${to}</strong> but was redirected because 
              Resend sandbox mode only allows sending to verified recipients.<br>
              <small>To fix this permanently, verify your domain at <a href="https://resend.com/domains">resend.com/domains</a></small>
            </div>
            ${html}
          `
        });

        if (!fallback.error) {
          console.log(`✅ Email redirected to owner (${OWNER_EMAIL}) successfully`);
          return { success: true, data: fallback.data };
        }

        console.error('❌ Redirect also failed:', fallback.error);
        return { success: false, error: `Email delivery failed: ${fallback.error.message}` };
      }

      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to: ${to} (id: ${data?.id})`);
    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    // Don't let email failures crash the entire request in non-critical paths
    return { success: false, error: error.message };
  }
}


// Email template wrapper
function emailTemplate(content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .amount { font-size: 24px; color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        ${content}
        <div class="footer">
          <p>© ${new Date().getFullYear()} SMC Protocol. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Welcome email
export async function sendWelcomeEmail(user) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Welcome to SMC! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for registering with SMC. We're excited to have you on board!</p>
      <p>Start your investment journey today and enjoy weekly returns of 2-5%.</p>
      
      <div class="highlight">
        <h3>Next Steps:</h3>
        <ol>
          <li>Complete your KYC verification</li>
          <li>Choose an investment index</li>
          <li>Make your first investment</li>
          <li>Start earning weekly returns</li>
        </ol>
      </div>
      
      <center>
        <a href="${APP_URL}/kyc" class="button">Complete KYC Now</a>
      </center>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Best regards,<br><strong>The SMC Team</strong></p>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Welcome to SMC - Start Your Investment Journey!',
    html
  });
}

// Email verification
export async function sendVerificationEmail(user, token) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const html = emailTemplate(`
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Please verify your email address to complete your registration.</p>
      
      <center>
        <a href="${verifyUrl}" class="button">Verify Email</a>
      </center>
      
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
      
      <p><em>This link will expire in 24 hours.</em></p>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Verify Your Email - SMC',
    html
  });
}

// Password reset email
export async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const userName = user.name || user.email || 'User';

  const html = emailTemplate(`
    <div class="header">
      <h1>🔐 Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We received a request to reset your SMC account password. Click the button below to create a new password.</p>
      <p><strong>⏱️ This link will expire in 1 hour.</strong></p>
      
      <center>
        <a href="${resetUrl}" class="button">Reset My Password</a>
      </center>
      
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #667eea; font-size: 13px;">${resetUrl}</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 13px;">If you did not request a password reset, please ignore this email. Your password will not change unless you click the link above. If you're concerned about your account security, please contact our support team.</p>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Reset Your Password - SMC',
    html
  });
}


// KYC approval email
export async function sendKYCApprovalEmail(user) {
  const html = emailTemplate(`
    <div class="header">
      <h1>KYC Approved! ✅</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Great news! Your KYC verification has been approved.</p>
      <p>You can now start investing in our various indices and earn weekly returns.</p>
      
      <center>
        <a href="${APP_URL}/invest" class="button">Start Investing</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'KYC Verification Approved - SMC',
    html
  });
}

// KYC rejection email
export async function sendKYCRejectionEmail(user, reason) {
  const html = emailTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);">
      <h1>KYC Verification Update</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Unfortunately, your KYC verification could not be approved.</p>
      
      <div class="highlight">
        <strong>Reason:</strong><br>
        ${reason}
      </div>
      
      <p>Please resubmit your documents with the correct information.</p>
      
      <center>
        <a href="${APP_URL}/kyc/resubmit" class="button">Resubmit Documents</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'KYC Verification Update - SMC',
    html
  });
}

// Payment request confirmation email
export async function sendPaymentConfirmationEmail(user, paymentRequest) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Payment Request Submitted</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your payment request has been submitted successfully.</p>
      
      <div class="highlight">
        <p><strong>Request ID:</strong> ${paymentRequest.requestId}</p>
        <p><strong>Amount:</strong> <span class="amount">$${paymentRequest.amount.toLocaleString()}</span></p>
        <p><strong>Status:</strong> Pending Upload</p>
      </div>
      
      <p>Please upload your payment proof within 24 hours to complete the process.</p>
      
      <center>
        <a href="${APP_URL}/payments/${paymentRequest._id}" class="button">Upload Payment Proof</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: `Payment Request ${paymentRequest.requestId} - SMC`,
    html
  });
}

// Payment approved email
export async function sendPaymentApprovedEmail(user, paymentRequest, investment) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Payment Approved! ✅</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your payment has been verified and approved.</p>
      
      <div class="highlight">
        <p><strong>Request ID:</strong> ${paymentRequest.requestId}</p>
        <p><strong>Amount Invested:</strong> <span class="amount">$${paymentRequest.amount.toLocaleString()}</span></p>
        <p><strong>Investment ID:</strong> ${Array.isArray(investment) ? investment[0]?._id : investment?._id || 'Pending'}</p>
      </div>
      
      <p>Your investment is now active and you'll start receiving weekly returns.</p>
      
      <center>
        <a href="${APP_URL}/investments" class="button">View Investments</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Payment Approved - Investment Active! - SMC',
    html
  });
}

// Payment rejected email
export async function sendPaymentRejectionEmail(user, reason) {
  const html = emailTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);">
      <h1>Payment Rejected ❌</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We're sorry to inform you that your payment verification was not successful.</p>
      
      <div class="highlight">
        <p><strong>Reason for rejection:</strong></p>
        <p style="color: #dc2626; font-weight: bold;">${reason}</p>
      </div>
      
      <p>Please review the reason and submit a new payment request with correct details or a valid proof of payment.</p>
      
      <center>
        <a href="${APP_URL}/indices" class="button">Try Again</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Payment Verification Failed - SMC',
    html
  });
}

// Withdrawal request confirmation
export async function sendWithdrawalRequestEmail(user, withdrawal) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Withdrawal Request Received</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your withdrawal request has been submitted.</p>
      
      <div class="highlight">
        <p><strong>Request ID:</strong> ${withdrawal.requestId}</p>
        <p><strong>Amount:</strong> <span class="amount">$${withdrawal.amount.toLocaleString()}</span></p>
        <p><strong>Bank:</strong> ${withdrawal.bankDetails.bankName}</p>
        <p><strong>Account:</strong> XXXX${withdrawal.bankDetails.accountNumber.slice(-4)}</p>
      </div>
      
      <p>Your request will be processed within 24-48 hours.</p>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: `Withdrawal Request ${withdrawal.requestId} - SMC`,
    html
  });
}

// Withdrawal approved email
export async function sendWithdrawalApprovedEmail(user, withdrawal) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Withdrawal Processed! 💰</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your withdrawal has been processed successfully.</p>
      
      <div class="highlight">
        <p><strong>Request ID:</strong> ${withdrawal.requestId}</p>
        <p><strong>Amount:</strong> <span class="amount">$${withdrawal.amount.toLocaleString()}</span></p>
        <p><strong>Transaction Ref:</strong> ${withdrawal.transactionReference}</p>
      </div>
      
      <p>The amount will be credited to your bank account within 1-2 business days.</p>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Withdrawal Processed - SMC',
    html
  });
}

// Weekly returns email
export async function sendWeeklyReturnsEmail(user, returnData) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Weekly Returns Credited! 📈</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your weekly returns have been credited to your account.</p>
      
      <div class="highlight">
        <p><strong>Week:</strong> ${returnData.weekStart} - ${returnData.weekEnd}</p>
        <p><strong>Return Rate:</strong> ${returnData.returnRate}%</p>
        <p><strong>Amount Credited:</strong> <span class="amount">$${returnData.amount.toLocaleString()}</span></p>
        <p><strong>Total Investment:</strong> $${returnData.totalInvestment.toLocaleString()}</p>
      </div>
      
      <center>
        <a href="${APP_URL}/returns" class="button">View Returns</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Weekly Returns Credited - SMC',
    html
  });
}

// Support ticket confirmation
export async function sendTicketConfirmationEmail(user, ticket) {
  const html = emailTemplate(`
    <div class="header">
      <h1>Support Ticket Created</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>Your support ticket has been created successfully.</p>
      
      <div class="highlight">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Category:</strong> ${ticket.category}</p>
      </div>
      
      <p>Our team will respond within 24 hours.</p>
      
      <center>
        <a href="${APP_URL}/support" class="button">View Ticket</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: `Support Ticket ${ticket.ticketId} - SMC`,
    html
  });
}

// Ticket reply notification
export async function sendTicketReplyEmail(user, ticket, message) {
  const html = emailTemplate(`
    <div class="header">
      <h1>New Reply on Your Ticket</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>There's a new reply on your support ticket.</p>
      
      <div class="highlight">
        <p><strong>Ticket ID:</strong> ${ticket.ticketId}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Reply:</strong></p>
        <p style="background: white; padding: 10px; border-left: 3px solid #667eea;">${message}</p>
      </div>
      
      <center>
        <a href="${APP_URL}/support" class="button">View Ticket</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: `Reply on Ticket ${ticket.ticketId} - SMC`,
    html
  });
}
// Withdrawal rejection email
export async function sendWithdrawalRejectionEmail(user, withdrawal, reason) {
  const html = emailTemplate(`
    <div class="header" style="background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);">
      <h1>Withdrawal Rejected ❌</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>We're sorry to inform you that your withdrawal request was not successful.</p>
      
      <div class="highlight">
        <p><strong>Request ID:</strong> ${withdrawal.requestId}</p>
        <p><strong>Amount:</strong> <span class="amount">$${withdrawal.amount.toLocaleString()}</span></p>
        <p style="color: #dc2626; font-weight: bold; margin-top: 10px;">Reason: ${reason}</p>
      </div>
      
      <p>The amount has been refunded to your available balance.</p>
      <p>Please review the reason and submit a new withdrawal request with correct details.</p>
      
      <center>
        <a href="${APP_URL}/withdraw" class="button">Try Again</a>
      </center>
    </div>
  `);

  return await sendEmail({
    to: user.email,
    subject: 'Withdrawal Request Rejected - SMC',
    html
  });
}
