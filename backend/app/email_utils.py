import logging
import os
import smtplib
from email.message import EmailMessage


logger = logging.getLogger(__name__)


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def send_email(to_email: str, subject: str, plain_text_body: str, html_body: str | None = None) -> tuple[bool, str | None]:
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_username = os.environ.get("SMTP_USERNAME")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    smtp_from_email = os.environ.get("SMTP_FROM_EMAIL") or smtp_username
    smtp_from_name = os.environ.get("SMTP_FROM_NAME", "School Management System")
    smtp_use_tls = _as_bool(os.environ.get("SMTP_USE_TLS"), True)
    smtp_use_ssl = _as_bool(os.environ.get("SMTP_USE_SSL"), False)

    # if not smtp_host or not smtp_from_email:
    #     return False, "SMTP is not configured"
    if not smtp_host or not smtp_from_email or not smtp_username or not smtp_password:
        return False, "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, and SMTP_FROM_EMAIL."

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{smtp_from_name} <{smtp_from_email}>"
    message["To"] = to_email
    message.set_content(plain_text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    try:
        if smtp_use_ssl:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=20) as server:
                if smtp_username and smtp_password:
                    server.login(smtp_username, smtp_password)
                server.send_message(message)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
                server.ehlo()
                if smtp_use_tls:
                    server.starttls()
                    server.ehlo()
                if smtp_username and smtp_password:
                    server.login(smtp_username, smtp_password)
                server.send_message(message)
        return True, None
    except Exception as exc:
        logger.exception("Failed to send email to %s", to_email)
        return False, str(exc)


def send_school_approval_email(
    *,
    to_email: str,
    admin_name: str,
    school_name: str,
    organisation_code: str,
    username: str,
    temp_password: str,
) -> tuple[bool, str | None]:
    app_base_url = os.environ.get("APP_BASE_URL", "http://127.0.0.1:3001").rstrip("/")
    organisation_login_url = f"{app_base_url}/login"
    credential_login_url = f"{app_base_url}/login/credentials"

    subject = f"Your {school_name} account has been approved"
    plain_text_body = f"""Hello {admin_name},

Your school registration for {school_name} has been approved.

Use the following credentials to access your account:

Organisation ID: {organisation_code}
Username: {username}
Temporary Password: {temp_password}

Login steps:
1. Open {organisation_login_url}
2. Enter Organisation ID: {organisation_code}
3. Continue to the credentials page
4. Sign in with username: {username}
5. Use the temporary password above

Credentials login page: {credential_login_url}

For security, please change the password after your first login.

Regards,
School Management System
"""

    html_body = f"""
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
    <h2>Your school account has been approved</h2>
    <p>Hello {admin_name},</p>
    <p>Your school registration for <strong>{school_name}</strong> has been approved.</p>
    <p>Use the following credentials to access your account:</p>
    <table style="border-collapse: collapse; margin: 12px 0;">
      <tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;"><strong>Organisation ID</strong></td><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">{organisation_code}</td></tr>
      <tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;"><strong>Username</strong></td><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">{username}</td></tr>
      <tr><td style="padding: 6px 12px; border: 1px solid #cbd5e1;"><strong>Temporary Password</strong></td><td style="padding: 6px 12px; border: 1px solid #cbd5e1;">{temp_password}</td></tr>
    </table>
    <p><strong>Login steps:</strong></p>
    <ol>
      <li>Open <a href="{organisation_login_url}">{organisation_login_url}</a></li>
      <li>Enter Organisation ID: <strong>{organisation_code}</strong></li>
      <li>Continue to the credentials page</li>
      <li>Sign in with username: <strong>{username}</strong></li>
      <li>Use the temporary password above</li>
    </ol>
    <p>Direct credentials page: <a href="{credential_login_url}">{credential_login_url}</a></p>
    <p>For security, please change the password after your first login.</p>
    <p>Regards,<br />School Management System</p>
  </body>
</html>
"""

    return send_email(
        to_email=to_email,
        subject=subject,
        plain_text_body=plain_text_body,
        html_body=html_body,
    )
