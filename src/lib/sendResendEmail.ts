import { Resend } from "resend";

const DEFAULT_FROM = "Laks Dent Agency <onboarding@resend.dev>";

export interface ResendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM;
}

export async function sendResendEmail(
  payload: ResendEmailPayload
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("[sendResendEmail] Missing RESEND_API_KEY");
    return false;
  }

  console.log(
    `[sendResendEmail] Sending to=${payload.to} subject="${payload.subject}"`
  );

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      console.error(
        "[sendResendEmail] Resend error:",
        error.message ?? error
      );
      return false;
    }

    console.log("[sendResendEmail] Email sent:", data?.id);
    return true;
  } catch (error) {
    console.error("[sendResendEmail] Error:", error);
    return false;
  }
}
