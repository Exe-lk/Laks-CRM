import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseclient';
import { useVerifyStatusMutation } from '../../../redux/slices/practiceProfileSlice';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const [updatestatus] = useVerifyStatusMutation();
  const [verificationFinished, setVerificationFinished] = useState(false);

  useEffect(() => {
    if (!router.isReady || verificationFinished) return;

    const handleEmailVerification = async () => {
      try {
        // PKCE / server-side redirect: ?code=... (must run before relying on hash)
        const code =
          typeof router.query.code === 'string' ? router.query.code : null;
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus('error');
            setMessage(
              exchangeError.message ||
                'This verification link has expired or is invalid. Please request a new email or try logging in.'
            );
            setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
            return;
          }
          window.history.replaceState(null, '', '/practiceUser/verifyEmail');
        }

        // Query-token flow (some Supabase email templates)
        const tokenHash =
          typeof router.query.token_hash === 'string'
            ? router.query.token_hash
            : null;
        const otpType =
          typeof router.query.type === 'string' ? router.query.type : 'signup';
        if (tokenHash) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType as 'signup' | 'email' | 'recovery',
          });
            if (verifyError) {
              setStatus('error');
            setMessage(
              verifyError.message ||
                'This verification link has expired or is invalid. Please request a new verification email or try logging in.'
            );
            setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
              return;
          }
        }

        // Implicit / hash fragment: do NOT strip the hash before reading the session
        await new Promise((resolve) => setTimeout(resolve, 300));
        let {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        
        if (sessionError) {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        if (!session && typeof window !== 'undefined' && window.location.hash) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const retry = await supabase.auth.getSession();
          session = retry.data.session;
        }

        if (!session) {
            setStatus('error');
          setMessage(
            'This verification link has expired or is invalid. Please request a new verification email or try logging in.'
          );
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
            return;
          }
          
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError || !userData.user?.email) {
              setStatus('error');
          setMessage(
            'Could not retrieve user information. Please try logging in.'
          );
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        const user = userData.user;
        const userEmail = user.email;
        if (!userEmail) {
            setStatus('error');
            setMessage('Could not retrieve email address. Please try logging in.');
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        if (!user.email_confirmed_at) {
          setStatus('error');
          setMessage(
            'Email verification is still pending. Please use the latest link from your email.'
          );
          setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
          return;
        }

        try {
          await updatestatus({
            email: userEmail,
            status: 'verify',
          }).unwrap();
        } catch (updateError) {
          console.error('Practice DB status update error:', updateError);
          // Email is confirmed in Supabase; still show success so the user can log in
        }

        setStatus('success');
        setMessage('Email verified successfully!');
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/practiceUser/verifyEmail');
        }
        setTimeout(() => router.push('/practiceUser/practiceLogin'), 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try logging in.');
        setTimeout(() => router.push('/practiceUser/practiceLogin'), 4000);
      } finally {
        setVerificationFinished(true);
      }
    };

    void handleEmailVerification();
  }, [
    router,
    router.isReady,
    router.query.code,
    router.query.token_hash,
    router.query.type,
    updatestatus,
    verificationFinished,
  ]);

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
