import { sendResendEmail } from "./sendResendEmail";

const DEFAULT_ADMIN_EMAIL = "info@laksdentagency.co.uk";

export function getAdminNotificationEmail(): string {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? "";
  const unquoted = raw.replace(/^["']|["']$/g, "");
  return unquoted || DEFAULT_ADMIN_EMAIL;
}

type UserType = "practice" | "locum";

export async function sendRegistrationEmailSafely(
  label: string,
  send: () => Promise<boolean>
): Promise<void> {
  try {
    const sent = await send();
    if (!sent) {
      console.error(`[${label}] Email was not sent`);
    }
  } catch (error) {
    console.error(`[${label}] Email notification failed:`, error);
  }
}

function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function userTypeLabel(userType: UserType): string {
  return userType === "practice" ? "Practice" : "Locum";
}

export async function notifyAdminNewRegistration(params: {
  userType: UserType;
  name: string;
  email: string;
  roleOrPracticeType: string;
  registeredAt?: Date;
}): Promise<boolean> {
  const label = userTypeLabel(params.userType);
  const typeField =
    params.userType === "practice" ? "Practice type" : "Job type";
  const timestamp = formatTimestamp(params.registeredAt);

  const subject = `New ${params.userType} registration awaiting approval — ${params.name}`;
  const text = [
    `A new ${label.toLowerCase()} has verified their email and is awaiting admin approval.`,
    "",
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `${typeField}: ${params.roleOrPracticeType}`,
    `Verified at: ${timestamp}`,
    "",
    "Please review and approve this registration in the admin dashboard.",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #C3EAE7; color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .detail-row { padding: 8px 0; border-bottom: 1px solid #ddd; }
          .detail-label { font-weight: bold; display: inline-block; width: 140px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New ${label} Registration</h2>
            <p>Awaiting admin approval</p>
          </div>
          <div class="content">
            <p>A new ${label.toLowerCase()} has verified their email address and is ready for your review.</p>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span>${params.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span>${params.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">${typeField}:</span>
              <span>${params.roleOrPracticeType}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Verified at:</span>
              <span>${timestamp}</span>
            </div>
            <p style="margin-top: 20px;">Please review and approve this registration in the admin dashboard.</p>
          </div>
          <div class="footer">
            <p>This is an automated email from Laks Dent Agency.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendResendEmail({
    to: getAdminNotificationEmail(),
    subject,
    text,
    html,
  });
}

export async function notifyUserRegistrationApproved(params: {
  userType: UserType;
  name: string;
  email: string;
  loginUrl: string;
}): Promise<boolean> {
  const label = userTypeLabel(params.userType);

  const subject = "Your Laks Dent Agency registration has been approved";
  const text = [
    `Dear ${params.name},`,
    "",
    `Your ${label.toLowerCase()} registration has been approved by our team.`,
    "Your registration process is now complete and you can log in to your account.",
    "",
    `Log in here: ${params.loginUrl}`,
    "",
    "If you have any questions, please contact us at info@laksdentagency.co.uk.",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #C3EAE7; color: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .button { background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none;
                    display: inline-block; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Registration Approved</h2>
          </div>
          <div class="content">
            <p>Dear ${params.name},</p>
            <p>Your ${label.toLowerCase()} registration has been approved by our team. Your registration process is now complete and you can log in to your account.</p>
            <div style="text-align: center;">
              <a href="${params.loginUrl}" class="button" target="_blank">Log In</a>
            </div>
            <p>If the button above does not work, copy and paste this link into your browser:</p>
            <p><a href="${params.loginUrl}">${params.loginUrl}</a></p>
            <p>If you have any questions, please contact us at <a href="mailto:info@laksdentagency.co.uk">info@laksdentagency.co.uk</a>.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Laks Dent Agency. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendResendEmail({
    to: params.email,
    subject,
    text,
    html,
  });
}
