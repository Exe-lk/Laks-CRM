import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseclient';
import {
  cleanVerificationUrl,
  confirmProfileEmail,
  establishSupabaseSession,
  resolveVerifiedUserEmail,
} from '../../../lib/emailVerification';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    if (!router.isReady || hasProcessed) return;

    const handleEmailVerification = async () => {
      try {
        const session = await establishSupabaseSession(router.query);

        if (!session) {
          setStatus('error');
          setMessage(
            'This verification link has expired or is invalid. Please request a new verification email or try logging in.'
          );
          setHasProcessed(true);
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        const userEmail = await resolveVerifiedUserEmail(
          () => supabase.auth.getUser(),
          (ms) => new Promise((resolve) => setTimeout(resolve, ms))
        );

        if (!userEmail) {
          setStatus('error');
          setMessage(
            'Could not retrieve user information. Please try logging in.'
          );
          setHasProcessed(true);
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        try {
          const result = await confirmProfileEmail({
            apiPath: '/api/practice/confirm-email',
            email: userEmail,
            status: 'verify',
          });

          if (!result.ok) {
            console.error('Practice profile status update failed:', result.data);
            setStatus('success');
            setMessage(
              'Email verified, but we could not update your profile status. Please contact support if login fails.'
            );
            setHasProcessed(true);
            cleanVerificationUrl('/practiceUser/verifyEmail');
            setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
            return;
          }

          if (result.adminNotificationSent === false) {
            console.warn(
              'Practice profile verified but admin notification email was not sent',
              result.adminNotificationError ?? result.data
            );
          }
        } catch (updateError) {
          console.error('Practice DB status update error:', updateError);
          setStatus('success');
          setMessage(
            'Email verified, but we could not update your profile status. Please contact support if login fails.'
          );
          setHasProcessed(true);
          cleanVerificationUrl('/practiceUser/verifyEmail');
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        setStatus('success');
        setMessage('Email verified successfully!');
        setHasProcessed(true);
        cleanVerificationUrl('/practiceUser/verifyEmail');
        setTimeout(() => router.push('/practiceUser/practiceLogin'), 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try logging in.');
        setHasProcessed(true);
        setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
      }
    };

    void handleEmailVerification();
  }, [router.isReady, hasProcessed, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">{message}</p>

          {status === 'verifying' && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-4 text-green-600">
              ✓ Verification successful! Redirecting...
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4">
              <div className="text-red-600">✗ {message}</div>
              <button
                type="button"
                onClick={() => router.push('/practiceUser/practiceLogin')}
                className="mt-2 text-blue-600 hover:text-blue-500"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
