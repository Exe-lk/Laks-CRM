import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseclient';
import { useVerifyStatusMutation } from '../../../redux/slices/locumProfileSlice';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const [updateStatus] = useVerifyStatusMutation();
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Wait a bit for Supabase to process hash fragments from URL
    const handleEmailVerification = async () => {
      if (hasProcessed) return;
      
      try {
        // Clean up URL hash fragments after Supabase processes them
        if (typeof window !== 'undefined' && window.location.hash) {
          // Wait for Supabase to process hash fragments
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Clean the URL (remove hash)
          const cleanUrl = window.location.pathname;
          window.history.replaceState(null, '', cleanUrl);
        } else {
          // Wait a moment for Supabase to process any hash fragments
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Try to get existing session
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // If no session, check for token in URL query params or hash
        if (!session && !sessionError) {
          const { token_hash, type } = router.query;
          
          // If we have a token in query params, try to verify it
          if (token_hash && typeof token_hash === 'string') {
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: token_hash,
              type: (type as any) || 'signup',
            });
            
            if (verifyError) {
              // Token might be expired or invalid
              setStatus('error');
              setMessage('This verification link has expired or is invalid. Please request a new verification email or try logging in.');
              setTimeout(() => {
                router.push('/locumStaff/login');
              }, 3000);
              setHasProcessed(true);
              return;
            }
            
            // Get session after verification
            const sessionRes = await supabase.auth.getSession();
            session = sessionRes.data.session;
          }
        }
        
        if (sessionError) {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          setTimeout(() => {
            router.push('/locumStaff/login');
          }, 3000);
          setHasProcessed(true);
          return;
        }

        if (session) {
          const { data: user, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            setStatus('error');
            setMessage('Could not retrieve user information. Please try logging in.');
            setTimeout(() => {
              router.push('/locumStaff/login');
            }, 3000);
            setHasProcessed(true);
            return;
          }
          
          if (user?.user?.email) {
            // Check if email is confirmed (either just now or previously)
            if (user?.user?.email_confirmed_at) {
              try {
                const response = await updateStatus({ email: user.user.email, status: 'verify' });
                
                if (response && !response.error) {
                  setStatus('success');
                  setMessage('Email verified successfully!');
                  setHasProcessed(true);
                  // Clean URL before redirect
                  if (typeof window !== 'undefined') {
                    window.history.replaceState(null, '', '/locumStaff/verifyEmail');
                  }
                  setTimeout(() => {
                    router.push('/locumStaff/login');
                  }, 2000);
                } else {
                  // Even if status update fails, email is verified in Supabase
                  // Check if user is already verified in DB
                  setStatus('success');
                  setMessage('Email verified successfully!');
                  setHasProcessed(true);
                  // Clean URL before redirect
                  if (typeof window !== 'undefined') {
                    window.history.replaceState(null, '', '/locumStaff/verifyEmail');
                  }
                  setTimeout(() => {
                    router.push('/locumStaff/login');
                  }, 2000);
                }
              } catch (updateError) {
                console.error('Status update error:', updateError);
                // Email is verified in Supabase, so show success even if DB update fails
                setStatus('success');
                setMessage('Email verified successfully!');
                setHasProcessed(true);
                setTimeout(() => {
                  router.push('/locumStaff/login');
                }, 2000);
              }
            } else {
              setStatus('error');
              setMessage('Email verification is still pending. Please check your email for the confirmation link.');
              setTimeout(() => {
                router.push('/locumStaff/login');
              }, 3000);
              setHasProcessed(true);
            }
          } else {
            setStatus('error');
            setMessage('Could not retrieve email address. Please try logging in.');
            setTimeout(() => {
              router.push('/locumStaff/login');
            }, 3000);
            setHasProcessed(true);
          }
        } else {
          // No session and no token in URL - link might be expired or already used
          setStatus('error');
          setMessage('This verification link has expired or is invalid. Please request a new verification email or try logging in.');
          setTimeout(() => {
            router.push('/locumStaff/login');
          }, 3000);
          setHasProcessed(true);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try logging in.');
        setTimeout(() => {
          router.push('/locumStaff/login');
        }, 3000);
        setHasProcessed(true);
      }
    };

    // Only run if router is ready and we haven't processed yet
    if (router.isReady && !hasProcessed) {
      handleEmailVerification();
    }
  }, [router, hasProcessed, updateStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          
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
                onClick={() => router.push('/locumStaff/login')}
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