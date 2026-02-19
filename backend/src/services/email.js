const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'noreply@gitb.lt';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gitb.lt';

const sendApplicationReceivedEmail = async (email, firstName, lastName, courseTitle, applicationId) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">GITB</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Global Institute of Tech and Business</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #3d7a4a;">Application Received!</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for applying to <strong>${courseTitle}</strong> at GITB!</p>
          <p>Your application has been received and your payment of <strong>€50.00</strong> has been confirmed.</p>
          <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;"><strong>What happens next?</strong></p>
            <p style="margin: 10px 0 0 0;">Our admissions team will review your application. You will receive another email within 3-5 business days with your admission decision.</p>
          </div>
          <p>Application ID: ${applicationId}</p>
          <p>If you have any questions, please contact us at support@gitb.lt</p>
          <p>Best regards,<br><strong>GITB Admissions Team</strong></p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: `GITB Admissions <${ADMIN_EMAIL}>`,
      to: [email],
      subject: `Application Received - ${courseTitle}`,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send application received email:', error);
    return false;
  }
};

const sendApplicationApprovedEmail = async (email, firstName, lastName, courseTitle, tempPassword) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
        <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">GITB</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Global Institute of Tech and Business</p>
        </div>
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #3d7a4a; text-align: center; margin-bottom: 20px;">Congratulations, ${firstName}!</h2>
          <p>We are pleased to inform you that your application to <strong>${courseTitle}</strong> has been approved!</p>
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3d7a4a;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Your Login Credentials</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <span style="color: #e53935;">${tempPassword}</span></p>
          </div>
          <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #e65100; font-size: 14px;">
              <strong>Important:</strong> Please change your password after your first login.
            </p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${FRONTEND_URL}/login" style="display: inline-block; padding: 15px 40px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Access Student Portal
            </a>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: `GITB Admissions <${ADMIN_EMAIL}>`,
      to: [email],
      subject: `🎓 Admission Granted - Welcome to GITB, ${firstName}!`,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send approval email:', error);
    return false;
  }
};

const sendApplicationRejectedEmail = async (email, firstName, lastName, courseTitle, reason) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: #333; color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">GITB</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Application Update</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for your interest in <strong>${courseTitle}</strong> at GITB.</p>
          <p>After careful review, we regret to inform you that we are unable to offer you admission at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>We encourage you to apply again in the future or consider our other programs.</p>
          <p>Best regards,<br><strong>GITB Admissions Team</strong></p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: `GITB Admissions <${ADMIN_EMAIL}>`,
      to: [email],
      subject: `Application Update - ${courseTitle}`,
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return false;
  }
};

const sendForgotPasswordEmail = async (email, firstName, resetToken) => {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">GITB</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 15px 40px; background: #3d7a4a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br><strong>GITB Team</strong></p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: `GITB <${ADMIN_EMAIL}>`,
      to: [email],
      subject: 'Password Reset Request - GITB',
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send forgot password email:', error);
    return false;
  }
};

const sendPasswordChangedEmail = async (email, firstName) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3d7a4a 0%, #2d5a3a 100%); color: white; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">GITB</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Password Changed Successfully</h2>
          <p>Hello ${firstName},</p>
          <p>Your password has been changed successfully.</p>
          <p>If you did not make this change, please contact support immediately.</p>
          <p>Best regards,<br><strong>GITB Team</strong></p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: `GITB <${ADMIN_EMAIL}>`,
      to: [email],
      subject: 'Password Changed - GITB',
      html
    });
    return true;
  } catch (error) {
    console.error('Failed to send password changed email:', error);
    return false;
  }
};

module.exports = {
  sendApplicationReceivedEmail,
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendForgotPasswordEmail,
  sendPasswordChangedEmail
};
