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

export type ResendSendResult =
  | { ok: true; messageId: string | null }
  | { ok: false; error: string };

function isValidEmail(address: string): boolean {
  return EMAIL_REGEX.test(address);
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResendFromAddress(): string {
  const fromEnv = process.env.RESEND_FROM_EMAIL?.trim();
  if (fromEnv && !fromEnv.includes("resend.dev")) {
    return fromEnv;
  }
  if (fromEnv?.includes("resend.dev")) {
    console.warn(
      "[sendResendEmail] Ignoring RESEND_FROM_EMAIL with resend.dev sandbox; using verified domain sender"
    );
  }
  return DEFAULT_FROM;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.length <= 2 ? "*" : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export async function sendResendEmail(
  payload: ResendEmailPayload
): Promise<ResendSendResult> {
  const to = payload.to?.trim();
  const subject = payload.subject?.trim();
  const from = getResendFromAddress();

  if (!to || !subject) {
    const error = "Missing required fields: to, subject";
    console.error(`[sendResendEmail] ${error}`);
    return { ok: false, error };
  }

  if (!isValidEmail(to)) {
    const error = `Invalid recipient email address: ${to}`;
    console.error(`[sendResendEmail] ${error}`);
    return { ok: false, error };
  }

  if (!payload.html?.trim() && !payload.text?.trim()) {
    const error = "Provide at least one of html or text content";
    console.error(`[sendResendEmail] ${error}`);
    return { ok: false, error };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    const error = "Missing RESEND_API_KEY";
    console.error(`[sendResendEmail] ${error}`);
    return { ok: false, error };
  }

  console.log(
    `[sendResendEmail] resendConfigured=true from=${from} to=${maskEmail(to)} subject="${subject}"`
  );

  try {
    const resend = new Resend(apiKey);
    const sendResult = payload.html?.trim()
      ? await resend.emails.send({
          from,
          to,
          subject,
          html: payload.html,
          ...(payload.text?.trim() ? { text: payload.text } : {}),
        })
      : await resend.emails.send({
          from,
          to,
          subject,
          text: payload.text!,
        });

    if (sendResult.error) {
      const name = sendResult.error.name ? `${sendResult.error.name}: ` : "";
      const error = `${name}${sendResult.error.message}`;
      console.error("[sendResendEmail] Resend error:", error);
      return { ok: false, error };
    }

    const messageId = sendResult.data?.id ?? null;
    console.log("[sendResendEmail] Email sent:", messageId);
    return { ok: true, messageId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);
    console.error("[sendResendEmail] Error:", message);
    return { ok: false, error: message };
  }
}
