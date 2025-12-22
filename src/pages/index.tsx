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
    // Handle Supabase authentication redirects from root URL
    const handleAuthRedirect = async () => {
      if (isHandlingAuth) return;
      
      // Check if there are hash fragments in the URL (Supabase auth tokens)
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        // Check if it's a Supabase auth hash (contains access_token, type, etc.)
        if (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery')) {
          setIsHandlingAuth(true);
          
          try {
            // Wait for Supabase to process the hash
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get the session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (session && session.user) {
              const email = session.user.email;
              
              if (email) {
                // Determine which verify email page to redirect to based on email domain or user type
                // We'll check the database to see if it's a locum, practice, or branch
                try {
                  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/auth/check-user-type?email=${encodeURIComponent(email)}`);
                  
                  if (response.ok) {
                    const data = await response.json();
                    
                    if (data.userType === 'locum') {
                      // Redirect to verify email page (hash will be processed there)
                      router.push('/locumStaff/verifyEmail');
                      return;
                    } else if (data.userType === 'practice') {
                      router.push('/practiceUser/verifyEmail');
                      return;
                    } else if (data.userType === 'branch') {
                      router.push('/branch/verifyEmail');
                      return;
                    }
                  }
                } catch (err) {
                  console.error('Error checking user type:', err);
                }
                
                // If we can't determine, clean the URL and let user navigate manually
                window.history.replaceState(null, '', '/');
              }
            }
            
            // If we can't determine the user type, clean the URL anyway
            window.history.replaceState(null, '', '/');
          } catch (error) {
            console.error('Error handling auth redirect:', error);
            // Clean the URL on error
            window.history.replaceState(null, '', '/');
          } finally {
            setIsHandlingAuth(false);
          }
        }
      }
    };

    if (router.isReady) {
      handleAuthRedirect();
    }
  }, [router, isHandlingAuth]);

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

        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-16 lg:mb-20">
              <div className="relative pl-6 lg:pl-8 border-l-4 border-gray-300 bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl lg:text-3xl text-gray-800 font-semibold leading-relaxed">
                 " After 5 years of hard work and experience, we have built up a cost-effective platform with fundamental facilities to approach both Practices and Locum parties.
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="space-y-4">
                <div className="relative w-full max-w-md mx-auto lg:mx-0">
                  <Image
                    src={image5}
                    alt="Clock showing time"
                    width={500}
                    height={350}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
                <p className="text-base lg:text-lg text-gray-700 text-center lg:text-left">
                  LocumLux – My Grandma took 50secs to register.
                </p>
              </div>

              <div className="space-y-6">
                <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
                  LocumLux has created the fastest and simplest system. It's a stepwise system for the users to register and use the functionalities so that it takes within 1 minute to register, and within 1 minute for any selected step.
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
