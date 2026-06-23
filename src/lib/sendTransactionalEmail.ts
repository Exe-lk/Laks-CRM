export interface TransactionalEmailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendTransactionalEmail(
  payload: TransactionalEmailPayload
): Promise<boolean> {
  const functionUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL;
  const fnSecret = process.env.SEND_EMAIL_FN_SECRET;

  if (!functionUrl || !fnSecret) {
    console.error("[sendTransactionalEmail] Missing email configuration");
    return false;
  }

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${fnSecret}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `[sendTransactionalEmail] Failed (${response.status}):`,
        body
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[sendTransactionalEmail] Error:", error);
    return false;
  }
}
