import { Resend } from "resend";

const FROM_EMAIL = "info@laksdentagency.co.uk";
const FROM_NAME = "Laks Dent Agency";
const DEFAULT_FROM = `${FROM_NAME} <${FROM_EMAIL}>`;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ResendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function isValidEmail(address: string): boolean {
  return EMAIL_REGEX.test(address);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
}

export async function sendResendEmail(
  payload: ResendEmailPayload
): Promise<boolean> {
  const to = payload.to?.trim();
  const subject = payload.subject?.trim();

  if (!to || !subject) {
    console.error("[sendResendEmail] Missing required fields: to, subject");
    return false;
  }

  if (!isValidEmail(to)) {
    console.error(`[sendResendEmail] Invalid recipient email address: ${to}`);
    return false;
  }

  if (!payload.html?.trim() && !payload.text?.trim()) {
    console.error("[sendResendEmail] Provide at least one of html or text content");
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("[sendResendEmail] Missing RESEND_API_KEY");
    return false;
  }

  console.log(
    `[sendResendEmail] Sending from=${getFromAddress()} to=${to} subject="${subject}"`
  );

  try {
    const resend = new Resend(apiKey);
    const sendResult = payload.html?.trim()
      ? await resend.emails.send({
          from: getFromAddress(),
          to,
          subject,
          html: payload.html,
          ...(payload.text?.trim() ? { text: payload.text } : {}),
        })
      : await resend.emails.send({
          from: getFromAddress(),
          to,
          subject,
          text: payload.text!,
        });

    if (sendResult.error) {
      const name = sendResult.error.name ? `${sendResult.error.name}: ` : "";
      console.error(
        "[sendResendEmail] Resend error:",
        `${name}${sendResult.error.message}`
      );
      return false;
    }

    console.log("[sendResendEmail] Email sent:", sendResult.data?.id);
    return true;
  } catch (error) {
    console.error("[sendResendEmail] Error:", error);
    return false;
  }
}
