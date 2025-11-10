import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseclient';

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();

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
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/branch/confirm-email`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    email: user.user.email, 
                    status: 'pending approval' 
                  }),
                });

                const data = await response.json();
                
                if (response.ok && !data.error) {
                  setStatus('success');
                  setMessage('Email verified successfully!');
                  setTimeout(() => {
                    router.push('/branch/login');
                  }, 2000);
                } else {
                  setStatus('error');
                  setMessage(data.error || 'Status update failed: Unknown error');
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-black">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          
          {status === 'verifying' && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3EAE7] mx-auto"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-green-600 font-semibold">
                ✓ Verification successful! Redirecting to login...
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-red-600 mb-3">✗ {message}</div>
              <button
                onClick={() => router.push('/branch/login')}
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
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

