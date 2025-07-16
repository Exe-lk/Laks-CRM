import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseclient';
import { useVerifyStatusMutation } from '../../../redux/slices/locumProfileSlice';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const [updateStatus] = useVerifyStatusMutation();
 

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setMessage('Verification failed. Please try again.');
          return;
        }

        if (session) {
          const { data: user } = await supabase.auth.getUser();
          console.log(user)
          
          if (user?.user?.email_confirmed_at) {
            if (user?.user?.email) {
              try {
                const response = await updateStatus({ email: user.user.email, status: 'verify' });
                console.log(response)
                if (response && !response.error) {
                  setStatus('success');
                  setMessage('Email verified successfully!');
                  setTimeout(() => {
                    router.push('/');
                  }, 2000);
                } else if (response && response.error) {
                  setStatus('error');
                  let errorMsg = 'Status update failed: Unknown error';
                  const err = response.error as any;
                  if (err && typeof err === 'object') {
                    if ('data' in err && err.data && typeof err.data === 'object' && 'error' in err.data) {
                      errorMsg = 'Status update failed: ' + err.data.error;
                    } else if ('message' in err) {
                      errorMsg = 'Status update failed: ' + err.message;
                    }
                  }
                  setMessage(errorMsg);
                  return;
                } else {
                  setStatus('error');
                  setMessage('Status update failed: Unknown error');
                  return;
                }
              } catch (updateError) {
                console.error('Status update error:', updateError);
                setStatus('error');
                let errorMsg = 'Status update failed: Unknown error';
                if (updateError && typeof updateError === 'object' && 'message' in updateError) {
                  errorMsg = 'Status update failed: ' + (updateError as any).message;
                }
                setMessage(errorMsg);
                return;
              }
            }
          } else {
            setStatus('error');
            setMessage('Email verification is still pending.');
          }
        } else {
          setStatus('error');
          setMessage('No active session found.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    handleEmailVerification();
  }, [router]);

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
                onClick={() => router.push('/login')}
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