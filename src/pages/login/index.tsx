import { useState } from "react";
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';

const initialValues = {
  email: '',
  password: '',
  rememberMe: false,
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
      console.log('Form values:', values);

      setTimeout(() => {
        console.log({ email: values.email, password: values.password, rememberMe: values.rememberMe });
      }, 2000);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50/30 to-white px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-[#C3EAE7]/30 to-[#C3EAE7]/10 rounded-full blur-xl animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-[#C3EAE7]/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-r from-black/5 to-[#C3EAE7]/15 rounded-full blur-lg animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-10 right-10 w-16 h-16 bg-gradient-to-bl from-[#C3EAE7]/25 to-black/10 rounded-full blur-lg animate-bounce" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute bottom-40 left-1/3 w-20 h-20 bg-gradient-to-tr from-[#C3EAE7]/20 to-transparent rounded-full blur-lg animate-pulse" style={{ animationDuration: '3.5s' }}></div>

        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #C3EAE7 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-[#C3EAE7] rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-2.5 h-2.5 bg-[#C3EAE7] rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '2.5s' }}></div>
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.5s' }}></div>

        <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#C3EAE7]/20 to-transparent"></div>
        <div className="absolute bottom-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black/10 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-10 mt-4">
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-br from-black via-gray-800 to-black rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform rotate-3 group-hover:rotate-0 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <svg className="w-12 h-12 text-[#C3EAE7] relative z-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-28 border-2 border-[#C3EAE7]/30 rounded-full animate-spin" style={{ animationDuration: '10s' }}></div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-black via-gray-800 to-black bg-clip-text text-transparent mb-3 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-600 text-xl font-medium">Sign in to continue your journey</p>

          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-[#C3EAE7] rounded-full"></div>
            <div className="w-3 h-3 bg-gradient-to-br from-[#C3EAE7] to-[#C3EAE7]/70 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-br from-[#C3EAE7] to-[#C3EAE7]/70 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-[#C3EAE7] rounded-full"></div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#C3EAE7]/20 via-[#C3EAE7]/10 to-[#C3EAE7]/20 rounded-[2rem] blur-xl opacity-70 animate-pulse"></div>

          <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-[#C3EAE7]/40 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C3EAE7] via-black to-[#C3EAE7]"></div>

            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#C3EAE7]/30 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#C3EAE7]/30 rounded-bl-lg"></div>

            <form onSubmit={formik.handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="block text-sm font-black text-black uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C3EAE7]/10 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className="h-6 w-6 text-gray-400 group-focus-within:text-[#C3EAE7] transition-all duration-300 group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    onBlur={formik.handleBlur}
                    className={`relative w-full pl-14 pr-4 py-5 border-2 ${formik.errors.email && formik.touched.email ? 'border-red-500' : 'border-gray-200'
                      } rounded-2xl focus:outline-none focus:border-[#C3EAE7] focus:ring-4 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-white/90 text-black font-semibold placeholder-gray-400 text-lg group-focus-within:shadow-lg`}
                    placeholder="Enter your email address"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#C3EAE7] via-black to-[#C3EAE7] transition-all duration-500 group-focus-within:w-full rounded-full"></div>
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#C3EAE7]/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-l-2xl"></div>
                </div>
                {formik.errors.email && formik.touched.email && (
                  <div className="text-red-500 text-sm mt-1 font-medium">{formik.errors.email}</div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-black text-black uppercase tracking-widest">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C3EAE7]/10 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <svg className="h-6 w-6 text-gray-400 group-focus-within:text-[#C3EAE7] transition-all duration-300 group-focus-within:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                    onBlur={formik.handleBlur}
                    className={`relative w-full pl-14 pr-14 py-5 border-2 ${formik.errors.password && formik.touched.password ? 'border-red-500' : 'border-gray-200'
                      } rounded-2xl focus:outline-none focus:border-[#C3EAE7] focus:ring-4 focus:ring-[#C3EAE7]/20 transition-all duration-300 bg-white/90 text-black font-semibold placeholder-gray-400 text-lg group-focus-within:shadow-lg`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#C3EAE7] transition-all duration-300 hover:scale-110 z-10"
                  >
                    {showPassword ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-[#C3EAE7] via-black to-[#C3EAE7] transition-all duration-500 group-focus-within:w-full rounded-full"></div>
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#C3EAE7]/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 rounded-l-2xl"></div>
                </div>
                {formik.errors.password && formik.touched.password && (
                  <div className="text-red-500 text-sm mt-1 font-medium">{formik.errors.password}</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
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
                    <div className={`w-5 h-5 border-2 ${formik.values.rememberMe ? 'border-[#C3EAE7] bg-[#C3EAE7]' : 'border-gray-300 bg-white'} rounded group-hover:border-[#C3EAE7] transition-colors duration-300`}></div>
                    {formik.values.rememberMe && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-black transition-colors font-semibold">Remember me</span>
                </label>
                <a href="#" className="text-sm text-[#C3EAE7] hover:text-black transition-colors font-black hover:underline relative group">
                  <span>Forgot password?</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></div>
                </a>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="relative w-full bg-gradient-to-r from-black via-gray-900 to-black hover:from-gray-800 hover:via-black hover:to-gray-800 text-white font-black py-5 px-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#C3EAE7]/40 overflow-hidden group disabled:opacity-70"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C3EAE7]/30 via-transparent to-[#C3EAE7]/30 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-500"></div>

                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  <span className="relative z-10 text-xl flex items-center justify-center space-x-2">
                    {formik.isSubmitting ? (
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
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C3EAE7] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center relative">
              <p className="text-gray-600 text-lg">
                Don't have an account?{' '}
                <a href="/register" className="text-[#C3EAE7] hover:text-black font-black transition-all duration-300 hover:underline relative group text-xl">
                  <span>Create one here</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#C3EAE7] to-black transition-all duration-300 group-hover:w-full"></div>
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Animation */}
        <div className="flex justify-center mt-10">
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-gradient-to-br from-[#C3EAE7] to-[#C3EAE7]/70 rounded-full animate-bounce shadow-lg"></div>
            <div className="w-3 h-3 bg-gradient-to-br from-black to-gray-800 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-br from-[#C3EAE7] to-[#C3EAE7]/70 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-br from-black to-gray-800 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-3 h-3 bg-gradient-to-br from-[#C3EAE7] to-[#C3EAE7]/70 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.8s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
