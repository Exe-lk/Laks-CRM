import type { NextApiRequest, NextApiResponse } from "next";
import { getAdminNotificationEmail } from "@/lib/registrationNotificationEmails";
import {
  getResendFromAddress,
  isResendConfigured,
  sendResendEmail,
} from "@/lib/sendResendEmail";

function getBearerToken(req: NextApiRequest): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.ADMIN_EMAIL_TEST_SECRET?.trim();
  if (!secret) {
    return res.status(503).json({
      error: "ADMIN_EMAIL_TEST_SECRET is not configured on the server",
    });
  }

  const token = getBearerToken(req);
  if (!token || token !== secret) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const adminRecipient = getAdminNotificationEmail();
  const from = getResendFromAddress();
  const resendConfigured = isResendConfigured();

  const result = await sendResendEmail({
    to: adminRecipient,
    subject: "Laks CRM admin notification test",
    text: [
      "This is a test email from the Laks CRM admin notification pipeline.",
      "",
      `Recipient: ${adminRecipient}`,
      `From: ${from}`,
      `Resend configured: ${resendConfigured}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n"),
    html: `
      <p>This is a test email from the Laks CRM admin notification pipeline.</p>
      <ul>
        <li><strong>Recipient:</strong> ${adminRecipient}</li>
        <li><strong>From:</strong> ${from}</li>
        <li><strong>Resend configured:</strong> ${resendConfigured}</li>
        <li><strong>Time:</strong> ${new Date().toISOString()}</li>
      </ul>
    `,
  });

  if (!result.ok) {
    return res.status(500).json({
      ok: false,
      error: result.error,
      adminRecipient,
      resendConfigured,
      from,
    });
  }

  return res.status(200).json({
    ok: true,
    messageId: result.messageId,
    adminRecipient,
    resendConfigured,
    from,
  });
}
