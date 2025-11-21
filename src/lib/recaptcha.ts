/**
 * Verify reCAPTCHA token on the server side
 * @param token - The reCAPTCHA token from the client
 * @returns Promise<boolean> - True if verification successful, false otherwise
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    return false;
  }

  if (!token) {
    console.error('No reCAPTCHA token provided');
    return false;
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('reCAPTCHA verification successful');
      return true;
    } else {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return false;
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

/**
 * Verify reCAPTCHA v3 token with score check
 * @param token - The reCAPTCHA token from the client
 * @param minScore - Minimum acceptable score (0.0 - 1.0), default 0.5
 * @returns Promise<{ success: boolean; score?: number }> - Verification result with score
 */
export async function verifyRecaptchaV3(
  token: string,
  minScore: number = 0.5
): Promise<{ success: boolean; score?: number }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    return { success: false };
  }

  if (!token) {
    console.error('No reCAPTCHA token provided');
    return { success: false };
  }

  try {
    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    if (data.success && data.score >= minScore) {
      console.log(`reCAPTCHA v3 verification successful (score: ${data.score})`);
      return { success: true, score: data.score };
    } else {
      console.error(
        'reCAPTCHA v3 verification failed:',
        data['error-codes'],
        `Score: ${data.score}`
      );
      return { success: false, score: data.score };
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false };
  }
}

