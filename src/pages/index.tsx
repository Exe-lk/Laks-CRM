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
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
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
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                    Introduction
                  </h2>
                  <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                    Laks Dent Agency is a leading dental locum staffing company specialising in matching qualified dental professionals with the staffing needs of dental practices. Our sister company, Lux Dent Agency, was established in 2017, and the concept for this platform was developed by our experienced team in 2018. Although two IT companies failed to complete the project despite significant financial investment, we remained determined and resilient. Rather than giving up, we returned with stronger ideas and embraced the latest technologies to bring our vision to life.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Company Overview</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      Laks Dent Agency provides temporary staffing solutions for dental practices experiencing staff shortages due to maternity leave, illness, annual leave, or other unforeseen circumstances. Our network includes dentists, dental hygienists, dental nurses, and administrative professionals, enabling practices to maintain continuity and efficiency during periods of transition.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">History and Background</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      Laks Dent Agency was founded with the vision of creating a dependable and efficient platform that connects skilled locum dental professionals with practices requiring temporary support. Drawing upon our own experience within the dental locum sector, we recognised the difficulties practices often encounter when seeking suitably qualified temporary staff at short notice. Our aim was to address this gap by delivering a practical, professional, and reliable solution.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Industry Analysis</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      The dental industry faces distinctive staffing challenges, particularly when practices are required to secure qualified professionals within limited timeframes. Laks Dent Agency addresses this growing demand through a streamlined platform that connects practices with experienced, pre-screened dental professionals. This significantly reduces the time, uncertainty, and administrative burden typically associated with temporary recruitment.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Services Offered</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      Laks Dent Agency provides a comprehensive range of services for both dental practices and dental professionals. For practices, we offer access to a broad and diverse pool of temporary staff, tailored to meet specific operational and clinical requirements. For dental professionals, we provide flexible opportunities to work across a variety of practice environments, enabling them to broaden their experience, enhance their skills, and expand their professional networks.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Quality Assurance</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      At Laks Dent Agency, quality assurance is of paramount importance. Every dental professional within our network undergoes a thorough screening and credential verification process. This includes the confirmation of licences, certifications, and professional references, ensuring that only suitably qualified and competent candidates are introduced to practices.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Client Testimonial</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      Laks Dent Agency delivers reliable staffing solutions to both independent dental practices and corporate organisations, supporting the full spectrum of general and specialist dentistry. Our professionals are carefully selected to ensure a smooth integration into each practice, while our strong focus on quality, precision, and client service sets us apart in the sector. As a reference, we provide services to: Perfect Smile, Together Dental, Dental Beauty, The Dental Lounge Wimbledon and many more.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Future Outlook</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      As demand for temporary staffing solutions continues to rise across the dental sector, Laks Dent Agency is strategically positioned for sustained growth and development. With a firm commitment to innovation, service quality, and cost-effectiveness, the company aims to establish itself as one of the most efficient and competitively priced agencies in the UK, creating lasting value for both dental practices and locum nurses.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">Conclusion</h3>
                    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">
                      Laks Dent Agency is committed to delivering exceptional temporary staffing solutions tailored to the unique needs of dental practices and dental professionals. Through our dedication to quality, reliability, and outstanding customer service, we are helping to shape the future of temporary staffing within the dental industry
                    </p>
                  </div>
                </div>
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
