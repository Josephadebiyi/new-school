"""
Email Service for GITB LMS
Uses Resend API to send branded emails
"""
import resend
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Initialize Resend
resend.api_key = os.environ.get('RESEND_API_KEY', '')
FROM_EMAIL = "noreply@gitb.lt"
GITB_WEBSITE = "https://www.gitb.lt"
GITB_LMS_URL = os.environ.get('FRONTEND_URL', 'https://gitb-admissions.preview.emergentagent.com')

# Logo URLs (using the deployed assets)
GITB_LOGO_URL = f"{GITB_LMS_URL}/images/gitb-logo.png"
EU_FLAG_URL = f"{GITB_LMS_URL}/images/eu-flag.png"
EAHEA_BADGE_URL = f"{GITB_LMS_URL}/images/eahea-badge.png"


def get_email_header():
    """Common email header with branding"""
    return f"""
    <div style="text-align: center; padding: 30px 20px; background-color: #314a06;">
        <img src="{GITB_LOGO_URL}" alt="GITB" style="height: 60px; width: auto;" />
        <p style="color: #7ebf0d; font-size: 14px; margin-top: 10px; margin-bottom: 0;">
            Global Institute of Tech and Business
        </p>
    </div>
    """


def get_email_footer():
    """Common email footer with EU and EAHEA badges"""
    return f"""
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef;">
        <div style="margin-bottom: 20px;">
            <img src="{EAHEA_BADGE_URL}" alt="EAHEA Accredited" style="height: 50px; width: auto; margin-right: 15px; vertical-align: middle;" />
            <img src="{EU_FLAG_URL}" alt="EU" style="height: 40px; width: auto; vertical-align: middle;" />
        </div>
        <p style="color: #666; font-size: 12px; margin: 0;">
            EAHEA Accredited | European Union & International Recognition
        </p>
        <div style="margin-top: 20px;">
            <a href="{GITB_WEBSITE}" style="color: #7ebf0d; text-decoration: none; margin: 0 10px;">Website</a>
            <a href="mailto:admissions@gitb.lt" style="color: #7ebf0d; text-decoration: none; margin: 0 10px;">Contact</a>
        </div>
        <p style="color: #999; font-size: 11px; margin-top: 20px;">
            © 2025 GITB - Global Institute of Tech and Business. All rights reserved.<br />
            Vilnius, Lithuania
        </p>
    </div>
    """


def get_email_template(content: str, title: str = ""):
    """Wrap content in branded email template"""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <style>
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .content {{
                padding: 40px 30px;
            }}
            h1 {{
                color: #314a06;
                font-size: 24px;
                margin-bottom: 20px;
            }}
            h2 {{
                color: #314a06;
                font-size: 20px;
                margin-bottom: 15px;
            }}
            p {{
                margin-bottom: 15px;
                color: #555;
            }}
            .btn {{
                display: inline-block;
                padding: 14px 28px;
                background-color: #7ebf0d;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                margin: 20px 0;
            }}
            .btn:hover {{
                background-color: #6ba50b;
            }}
            .info-box {{
                background-color: #f8f9fa;
                border-left: 4px solid #7ebf0d;
                padding: 15px 20px;
                margin: 20px 0;
            }}
            .credentials-box {{
                background-color: #314a06;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }}
            .credentials-box p {{
                color: #ffffff;
                margin: 5px 0;
            }}
            .highlight {{
                color: #7ebf0d;
                font-weight: 600;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            {get_email_header()}
            <div class="content">
                {content}
            </div>
            {get_email_footer()}
        </div>
    </body>
    </html>
    """


async def send_application_received_email(
    to_email: str,
    first_name: str,
    last_name: str,
    program_name: str,
    application_id: str
) -> bool:
    """Send email when application is received"""
    content = f"""
    <h1>Application Received! 🎉</h1>
    <p>Dear {first_name} {last_name},</p>
    <p>Thank you for applying to <strong>GITB - Global Institute of Tech and Business</strong>!</p>
    <p>We have received your application for the <strong class="highlight">{program_name}</strong> program and our admissions team is currently reviewing it.</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>Application Reference:</strong> {application_id}</p>
        <p style="margin: 5px 0 0 0;"><strong>Status:</strong> Under Review</p>
    </div>
    
    <h2>What happens next?</h2>
    <p>Our admissions team will carefully review your application and supporting documents. This process typically takes 3-5 business days.</p>
    <p>You will receive an email notification once a decision has been made on your application.</p>
    
    <p>If you have any questions in the meantime, please don't hesitate to contact us at <a href="mailto:admissions@gitb.lt" style="color: #7ebf0d;">admissions@gitb.lt</a></p>
    
    <p>Best regards,<br /><strong>GITB Admissions Team</strong></p>
    """
    
    html_content = get_email_template(content, "Application Received - GITB")
    
    try:
        params = {
            "from": f"GITB Admissions <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"Application Received - {program_name} | GITB",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Application received email sent to {to_email}: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send application received email to {to_email}: {e}")
        return False


async def send_application_approved_email(
    to_email: str,
    first_name: str,
    last_name: str,
    program_name: str,
    temp_password: str
) -> bool:
    """Send email when application is approved with login credentials"""
    content = f"""
    <h1>Congratulations! You're Accepted! 🎓</h1>
    <p>Dear {first_name} {last_name},</p>
    <p>We are delighted to inform you that your application to <strong>GITB - Global Institute of Tech and Business</strong> has been <strong class="highlight">APPROVED</strong>!</p>
    <p>Welcome to the <strong>{program_name}</strong> program. We're excited to have you join our community of learners!</p>
    
    <h2>Your Login Credentials</h2>
    <div class="credentials-box">
        <p><strong>Student Portal:</strong> <a href="{GITB_LMS_URL}/login" style="color: #7ebf0d;">{GITB_LMS_URL}/login</a></p>
        <p><strong>Email:</strong> {to_email}</p>
        <p><strong>Temporary Password:</strong> {temp_password}</p>
    </div>
    
    <div class="info-box" style="border-left-color: #dc3545;">
        <p style="margin: 0; color: #dc3545;"><strong>⚠️ Important:</strong> For security reasons, please change your password immediately after your first login.</p>
    </div>
    
    <p style="text-align: center;">
        <a href="{GITB_LMS_URL}/login" class="btn">Access Student Portal</a>
    </p>
    
    <h2>Getting Started</h2>
    <ol>
        <li>Log in to the Student Portal using the credentials above</li>
        <li>Change your password to something secure</li>
        <li>Complete your profile information</li>
        <li>Explore your enrolled courses and start learning!</li>
    </ol>
    
    <p>If you have any questions, please contact us at <a href="mailto:support@gitb.lt" style="color: #7ebf0d;">support@gitb.lt</a></p>
    
    <p>Welcome to GITB! 🚀<br /><strong>GITB Admissions Team</strong></p>
    """
    
    html_content = get_email_template(content, "Application Approved - GITB")
    
    try:
        params = {
            "from": f"GITB Admissions <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"🎉 Congratulations! Your Application is Approved | GITB",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Application approved email sent to {to_email}: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send application approved email to {to_email}: {e}")
        return False


async def send_application_rejected_email(
    to_email: str,
    first_name: str,
    last_name: str,
    program_name: str,
    reason: Optional[str] = None
) -> bool:
    """Send email when application is rejected"""
    reason_text = ""
    if reason:
        reason_text = f"""
        <div class="info-box">
            <p style="margin: 0;"><strong>Reason:</strong> {reason}</p>
        </div>
        """
    
    content = f"""
    <h1>Application Update</h1>
    <p>Dear {first_name} {last_name},</p>
    <p>Thank you for your interest in <strong>GITB - Global Institute of Tech and Business</strong> and the <strong>{program_name}</strong> program.</p>
    <p>After careful review of your application, we regret to inform you that we are unable to offer you admission at this time.</p>
    
    {reason_text}
    
    <p>We encourage you to:</p>
    <ul>
        <li>Explore our other programs that may be a better fit</li>
        <li>Reapply in the future when you meet the requirements</li>
        <li>Contact us for guidance on improving your application</li>
    </ul>
    
    <p>If you believe this decision was made in error or would like more information, please contact our admissions team at <a href="mailto:admissions@gitb.lt" style="color: #7ebf0d;">admissions@gitb.lt</a></p>
    
    <p>Best regards,<br /><strong>GITB Admissions Team</strong></p>
    """
    
    html_content = get_email_template(content, "Application Update - GITB")
    
    try:
        params = {
            "from": f"GITB Admissions <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"Application Update - {program_name} | GITB",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Application rejected email sent to {to_email}: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send application rejected email to {to_email}: {e}")
        return False


async def send_forgot_password_email(
    to_email: str,
    first_name: str,
    reset_token: str
) -> bool:
    """Send forgot password email with reset link"""
    reset_link = f"{GITB_LMS_URL}/reset-password?token={reset_token}"
    
    content = f"""
    <h1>Password Reset Request</h1>
    <p>Dear {first_name},</p>
    <p>We received a request to reset the password for your GITB account associated with this email address.</p>
    
    <p style="text-align: center;">
        <a href="{reset_link}" class="btn">Reset Your Password</a>
    </p>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #7ebf0d;">{reset_link}</p>
    
    <div class="info-box" style="border-left-color: #ffc107;">
        <p style="margin: 0;"><strong>⏰ Note:</strong> This link will expire in 1 hour for security reasons.</p>
    </div>
    
    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns about your account security.</p>
    
    <p>Best regards,<br /><strong>GITB Support Team</strong></p>
    """
    
    html_content = get_email_template(content, "Password Reset - GITB")
    
    try:
        params = {
            "from": f"GITB Support <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Password Reset Request | GITB",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Forgot password email sent to {to_email}: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send forgot password email to {to_email}: {e}")
        return False


async def send_password_changed_email(
    to_email: str,
    first_name: str
) -> bool:
    """Send notification that password was changed"""
    content = f"""
    <h1>Password Changed Successfully</h1>
    <p>Dear {first_name},</p>
    <p>Your password has been successfully changed.</p>
    
    <div class="info-box">
        <p style="margin: 0;">If you made this change, you can safely ignore this email.</p>
    </div>
    
    <p>If you did <strong>NOT</strong> make this change, please:</p>
    <ol>
        <li>Reset your password immediately at <a href="{GITB_LMS_URL}/login" style="color: #7ebf0d;">our login page</a></li>
        <li>Contact support at <a href="mailto:support@gitb.lt" style="color: #7ebf0d;">support@gitb.lt</a></li>
    </ol>
    
    <p>Best regards,<br /><strong>GITB Security Team</strong></p>
    """
    
    html_content = get_email_template(content, "Password Changed - GITB")
    
    try:
        params = {
            "from": f"GITB Security <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Password Changed Successfully | GITB",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Password changed email sent to {to_email}: {response}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password changed email to {to_email}: {e}")
        return False


async def send_test_email(to_email: str) -> dict:
    """Send a test email to verify email service is working"""
    content = f"""
    <h1>Test Email from GITB 🧪</h1>
    <p>Hello!</p>
    <p>This is a test email to verify that the GITB email service is working correctly.</p>
    
    <div class="info-box">
        <p style="margin: 0;"><strong>Email Service:</strong> Resend</p>
        <p style="margin: 5px 0 0 0;"><strong>From:</strong> {FROM_EMAIL}</p>
        <p style="margin: 5px 0 0 0;"><strong>To:</strong> {to_email}</p>
    </div>
    
    <p>If you received this email, the email service is configured correctly! ✅</p>
    
    <p>Best regards,<br /><strong>GITB Technical Team</strong></p>
    """
    
    html_content = get_email_template(content, "Test Email - GITB")
    
    try:
        params = {
            "from": f"GITB <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": "🧪 Test Email | GITB Email Service",
            "html": html_content,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Test email sent to {to_email}: {response}")
        return {"success": True, "message": f"Test email sent to {to_email}", "response": str(response)}
    except Exception as e:
        logger.error(f"Failed to send test email to {to_email}: {e}")
        return {"success": False, "message": str(e)}
