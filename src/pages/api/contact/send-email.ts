import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

const createEmailTemplate = (data: ContactFormData): string => {
  const fullName = `${data.firstName} ${data.lastName}`;
  const currentDate = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #C3EAE7 0%, #C3EAE7 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #000000; font-size: 28px; font-weight: bold;">New Contact Form Submission</h1>
              <p style="margin: 10px 0 0 0; color: #333333; font-size: 14px;">You have received a new message from your website</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                <strong style="color: #000000;">Date & Time:</strong> ${currentDate}
              </p>
              
              <div style="background-color: #f9f9f9; border-left: 4px solid #C3EAE7; padding: 20px; margin: 25px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 20px; font-weight: 600;">Contact Information</h2>
                
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px; width: 140px;"><strong style="color: #000000;">Full Name:</strong></td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong style="color: #000000;">Email:</strong></td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                      <a href="mailto:${data.email}" style="color: #C3EAE7; text-decoration: none;">${data.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong style="color: #000000;">Phone:</strong></td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">
                      <a href="tel:${data.phone}" style="color: #C3EAE7; text-decoration: none;">${data.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666666; font-size: 14px;"><strong style="color: #000000;">Service:</strong></td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px;">${data.service || 'Not specified'}</td>
                  </tr>
                </table>
              </div>
              
              <div style="margin: 25px 0;">
                <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 20px; font-weight: 600;">Message</h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
                  <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${data.message}</p>
                </div>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                <p style="margin: 0; color: #666666; font-size: 12px; line-height: 1.6;">
                  This email was sent from the contact form on your website.<br>
                  Please respond directly to <a href="mailto:${data.email}" style="color: #C3EAE7; text-decoration: none;">${data.email}</a> to reply to the sender.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Laks Dent Agency. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone, service, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({
        error: 'Missing required fields: firstName, lastName, email, phone, and message are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const formData: ContactFormData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service: service || 'Not specified',
      message: message.trim(),
    };

    // Send email using Resend
    // Note: For production, verify your domain in Resend dashboard to use a custom "from" address
    // Until then, you can use onboarding@resend.dev for testing
    const { data, error } = await resend.emails.send({
      from: 'Laks Dent Agency <onboarding@resend.dev>', // Change to 'noreply@laksdentagency.co.uk' after domain verification
      to: 'info@laksdentagency.co.uk',
      replyTo: formData.email,
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      html: createEmailTemplate(formData),
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        error: 'Failed to send email',
        details: error.message,
      });
    }

    console.log('Email sent successfully:', data);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: data?.id,
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message || 'An unexpected error occurred',
    });
  }
}

