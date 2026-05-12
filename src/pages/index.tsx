import Image from 'next/image';
import NavBar from "./components/navBar/nav";
import image4 from "../../public/assests/phone.png";
import image5 from "../../public/assests/clock.png";
import Footer from "./components/footer";
import Logo1 from "../../public/assests/logowithoutbg.png"
import { useRouter } from 'next/router';
import ReviewSlider from './components/ReviewSlider';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseclient';


const Home = () => {
  const router = useRouter();
  const [isHandlingAuth, setIsHandlingAuth] = useState(false);

  useEffect(() => {
    // Handle Supabase auth landing on root: PKCE ?code= or hash tokens.
    // Important: use full page navigation with hash preserved — router.push drops the hash.
    const handleAuthRedirect = async () => {
      if (isHandlingAuth) return;
      if (typeof window === 'undefined' || !router.isReady) return;

      const { code } = router.query;
      const hash = window.location.hash;

      const isAuthHash =
        hash &&
        (hash.includes('access_token') ||
          hash.includes('type=signup') ||
          hash.includes('type=recovery') ||
          hash.includes('type=email'));

      if (typeof code === 'string' && code.length > 0) {
        setIsHandlingAuth(true);
        try {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exErr) {
            console.error('Auth code exchange failed:', exErr);
            window.history.replaceState(null, '', '/');
            return;
          }
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const email = session?.user?.email;
          if (email) {
            const response = await fetch(
              `${window.location.origin}/api/auth/check-user-type?email=${encodeURIComponent(email)}`
            );
            if (response.ok) {
              const data = await response.json();
              const path =
                data.userType === 'locum'
                  ? '/locumStaff/verifyEmail'
                  : data.userType === 'practice'
                    ? '/practiceUser/verifyEmail'
                    : data.userType === 'branch'
                      ? '/branch/verifyEmail'
                      : null;
              if (path) {
                window.location.replace(path);
                return;
              }
            }
          }
          window.history.replaceState(null, '', '/');
        } catch (e) {
          console.error('Error handling auth code on home:', e);
          window.history.replaceState(null, '', '/');
        } finally {
          setIsHandlingAuth(false);
        }
        return;
      }

      if (isAuthHash) {
        setIsHandlingAuth(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 400));
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user?.email) {
            const email = session.user.email;
            try {
              const response = await fetch(
                `${window.location.origin}/api/auth/check-user-type?email=${encodeURIComponent(email)}`
              );
              if (response.ok) {
                const data = await response.json();
                const path =
                  data.userType === 'locum'
                    ? '/locumStaff/verifyEmail'
                    : data.userType === 'practice'
                      ? '/practiceUser/verifyEmail'
                      : data.userType === 'branch'
                        ? '/branch/verifyEmail'
                        : null;
                if (path) {
                  window.location.replace(path + hash);
                  return;
                }
              }
            } catch (err) {
              console.error('Error checking user type:', err);
            }
          }
          window.history.replaceState(null, '', '/');
        } catch (error) {
          console.error('Error handling auth redirect:', error);
          window.history.replaceState(null, '', '/');
        } finally {
          setIsHandlingAuth(false);
        }
      }
    };

    void handleAuthRedirect();
  }, [router.isReady, router.query, isHandlingAuth, router]);

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white pt-22">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#C3EAE7]/5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#C3EAE7]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C3EAE7]/15 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="relative order-2 lg:order-1 flex justify-center lg:block">
                <div className="grid grid-cols-1 gap-6 w-full">
                  <div className="space-y-6">
                    <div className="w-full flex justify-center">
                      <div className="max-w-xs sm:max-w-sm md:max-w-md w-full">
                        <Image
                          src={image4}
                          alt="Doctor"
                          width={500}
                          height={500}
                          className="w-full h-auto object-contain drop-shadow-2xl"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                
              <div className="w-full h-full">
                        <Image
                          src={Logo1}
                          alt="image"
                          width={500}
                          height={500}
                          className="w-full h-full object-cover"
                        />
                      </div>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <button className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-black border-2 border-[#C3EAE7] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#C3EAE7] transform hover:-translate-y-1 transition-all duration-300"
                    onClick={() => router.push('/practiceUser/practiceRegister')}>
                    <span className="relative z-10">Practices</span>
                  </button>
                  <button className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-black border-2 border-[#C3EAE7] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#C3EAE7] transform hover:-translate-y-1 transition-all duration-300"
                    onClick={() => router.push('/locumStaff/register')}>
                    Nurses
                  </button>
                  <button className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-black border-2 border-[#C3EAE7] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#C3EAE7] transform hover:-translate-y-1 transition-all duration-300"
                    onClick={() => router.push('/locumStaff/register')}>
                    Hygienist
                  </button>
                </div>
              </div>


            </div>
          </div>
        </section>

        {/* Quote banner */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-8">
            <div className="border-l-4 border-gray-300 pl-6">
              <p className="text-xl lg:text-2xl font-semibold text-gray-800 leading-relaxed">
                <span className="text-3xl text-gray-400 font-serif leading-none mr-2">"</span>
                With five years of expertise, we have developed an affordable, efficient platform designed to serve both Practices and Locums
              </p>
            </div>
          </div>
        </section>

        {/* Clock image + description */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div className="space-y-3">
                <div className="relative w-full max-w-sm mx-auto lg:mx-0">
                  <Image
                    src={image5}
                    alt="Clock showing time"
                    width={500}
                    height={350}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-sm text-gray-600">Laks Dent – My Grandma took 50secs to register.</p>
              </div>

              <div className="flex items-start pt-4">
                <p className="text-base lg:text-lg text-gray-800 leading-relaxed">
                Laks Dent has created a rapid and user-friendly step-by-step system, allowing users to register in under a minute and complete each selected step in less than a minute.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
         <ReviewSlider />
        </section>
        <Footer />

      </main>
    </>
  );
}

export default Home;
