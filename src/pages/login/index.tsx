import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import { useLoginMutation } from '../../redux/slices/locumProfileSlice';
import Swal from 'sweetalert2';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm = () => {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();

  const initialValues = {
    email: '',
    password: '',
    rememberMe: false,
  };

  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues,
    validate: (values) => {
      const errors: {
        email?: string;
        password?: string;
      } = {};

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }

      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        console.log('Login values:', values);

        const result = await login({
          email: values.email,
          password: values.password
        });

        console.log('Login result:', result);

        if ('data' in result && result.data) {
          const { accessToken, session } = result.data;

          if (accessToken) {
            localStorage.setItem('token', accessToken);
          } else if (session?.access_token) {
            localStorage.setItem('token', session.access_token);
          }

          localStorage.setItem('locumId', JSON.stringify(result.data.profile.id));
          // Store the profile object for later use (NavBar/Profile page)
          localStorage.setItem('profile', JSON.stringify(result.data.profile));

          await Swal.fire({
            title: 'Login Successful!',
            text: 'Welcome back!',
            icon: 'success',
            confirmButtonText: 'Continue',
            confirmButtonColor: '#C3EAE7',
            timer: 2000,
            timerProgressBar: true
          });

          router.push('/');
        } else if ('error' in result && result.error) {
          let errorMessage = 'Login failed';

          console.log('Login error details:', result.error);

          if ('data' in result.error && typeof result.error.data === 'object' && result.error.data !== null) {
            const errorData = result.error.data as any;
            console.log('Error data:', errorData);
            errorMessage = errorData.error || errorMessage;

            if (errorData.status === 'pending') {
              errorMessage = 'Your account is still pending approval. Please wait for admin approval.';
            } else if (errorData.status === 'deleted') {
              errorMessage = 'Your account has been deleted by the administrator.';
            }
          } else if ('message' in result.error) {
            errorMessage = result.error.message || errorMessage;
          }

          Swal.fire({
            title: 'Login Failed!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Try Again',
            confirmButtonColor: '#C3EAE7'
          });
        }
      } catch (error) {
        console.error('Login error:', error);
        Swal.fire({
          title: 'Login Failed!',
          text: 'An unexpected error occurred. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#C3EAE7'
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-black mb-2 bg-gradient-to-r from-black to-gray-700 bg-clip-text">Welcome Back</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Sign in to your account</p>

          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#C3EAE7] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div className="bg-[#C3EAE7] px-8 py-6">
            <h2 className="text-2xl font-bold text-black">Sign In</h2>
            <p className="text-gray-700 mt-1">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="px-8 py-8 space-y-6">
            <div className="space-y-2 group">
              <label htmlFor="email" className="block text-sm font-semibold text-black flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 border-2 ${formik.errors.email && formik.touched.email
                    ? 'border-red-500'
                    : 'border-gray-200'
                  } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                placeholder="Enter your email"
              />
              {formik.errors.email && formik.touched.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            <div className="space-y-2 group">
              <label htmlFor="password" className="block text-sm font-semibold text-black flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C3EAE7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 pr-12 border-2 ${formik.errors.password && formik.touched.password
                      ? 'border-red-500'
                      : 'border-gray-200'
                    } rounded-xl focus:border-[#C3EAE7] focus:ring-2 focus:ring-[#C3EAE7]/30 transition-all duration-200 outline-none hover:border-[#C3EAE7]/50 group-hover:shadow-md`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 p-2 bg-[#C3EAE7] hover:bg-[#A9DBD9] rounded-lg transition-all duration-200 transform hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.errors.password && formik.touched.password && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="bg-[#C3EAE7]/20 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center group cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      id="rememberMe"
                      checked={formik.values.rememberMe}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 ${formik.values.rememberMe
                        ? 'border-[#C3EAE7] bg-[#C3EAE7]'
                        : 'border-gray-300 bg-white'
                      } rounded group-hover:border-[#C3EAE7] transition-colors duration-300 flex items-center justify-center`}>
                      {formik.values.rememberMe && (
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-black transition-colors font-semibold">Remember me</span>
                </label>
                <a href="/forgetPassword" className="text-sm text-black font-bold">
                  Forgot password?
                </a>

              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#C3EAE7]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="flex items-center justify-center space-x-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="px-8 pb-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-black font-bold">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
