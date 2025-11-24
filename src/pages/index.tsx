import Image from 'next/image';
import NavBar from "./components/navBar/nav";
import image4 from "../../public/assests/phone.png";
import image5 from "../../public/assests/clock.png";
import Footer from "./components/footer";
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

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
              <div className="relative order-2 lg:order-1">
                <div className="hidden lg:block">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-6">
                      <div className="w-full h-full">
                        <Image
                          src={image4}
                          alt="Doctor"
                          width={500}
                          height={500}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-[#C3EAE7] text-black rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></span>
                    Trusted by 10,000+ Nurses
                  </div>
                  <p className="text-3xl lg:text-5xl xl:text-6xl font-bold text-black leading-tight">
                    Empowering Your{' '}
                    <span className="text-[#C3EAE7]">
                      Nursing Journey
                    </span>
                  </p>
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-lg">
                    Grow your skills, discover new job opportunities, and connect with peers — all through a trusted platform built just for nurses. Welcome to your next step.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
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

                <div className="flex items-center space-x-4 lg:space-x-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-6 h-6 lg:w-8 lg:h-8 bg-[#C3EAE7] rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                    <span className="ml-3">Join 10,000+ nurses</span>
                  </div>
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

        {/* <section className="py-16 lg:py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 text-center">
              {[
                { number: '10,000+', label: 'Active Nurses' },
                { number: '500+', label: 'Job Opportunities' },
                { number: '50+', label: 'Certification Courses' },
                { number: '99%', label: 'Satisfaction Rate' }
              ].map((stat, index) => (
                <div key={stat.label} className="group">
                  <div className="text-3xl lg:text-4xl xl:text-5xl font-bold text-[#C3EAE7] mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 text-sm lg:text-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}
        <Footer />

      </main>
    </>
  );
}

export default Home;
