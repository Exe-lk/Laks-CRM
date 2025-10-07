import Image from 'next/image';
import NavBar from "../../components/branchNavBar";
import image1 from "../../../../public/assests/66e8ec37c700d67af1aa8ac0608e157b5810b1f2.jpg";
import image2 from "../../../../public/assests/867184619ad618a8c654853279eb113657284e77.png";
import image3 from "../../../../public/assests/b274c82439ece60c86526c9adf4ed6912e98f6ed.jpg";
import image4 from "../../../../public/assests/ba6dc03ed4c4ed9261da138a6a60eb3f64f798e3.jpg";
import Footer from "../../components/footer";
import { useRouter } from 'next/navigation';

const Home = () => {
  const router = useRouter();

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[#C3EAE7]/5"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#C3EAE7]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C3EAE7]/15 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-[#C3EAE7] text-black rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></span>
                    Trusted by 10,000+ Nurses
                  </div>
                  <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight">
                    Empowering Your{' '}
                    <span className="text-[#C3EAE7]">
                      Nursing Journey
                    </span>
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-lg">
                    Grow your skills, discover new job opportunities, and connect with peers — all through a trusted platform built just for nurses. Welcome to your next step.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="group relative px-6 lg:px-8 py-3 lg:py-4 bg-black text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    onClick={() => router.push('/register')}>
                    <span className="relative z-10">Register Now</span>
                    <div className="absolute inset-0 bg-[#C3EAE7] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button className="px-6 lg:px-8 py-3 lg:py-4 bg-white text-black border-2 border-[#C3EAE7] font-semibold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#C3EAE7] transform hover:-translate-y-1 transition-all duration-300">
                    User Guide
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

              <div className="relative order-1 lg:order-2">
                <div className="lg:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-3">
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image4}
                          alt="Doctor"
                          width={300}
                          height={200}
                          className="w-full h-32 lg:h-40 object-cover rounded-2xl shadow-lg"
                        />
                      </div>
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image2}
                          alt="Nurse"
                          width={300}
                          height={200}
                          className="w-full h-32 lg:h-40 object-cover rounded-2xl shadow-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3 pt-6">
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image1}
                          alt="Smiling Nurse"
                          width={300}
                          height={200}
                          className="w-full h-32 lg:h-40 object-cover rounded-2xl shadow-lg"
                        />
                      </div>
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image3}
                          alt="Surgery"
                          width={300}
                          height={200}
                          className="w-full h-32 lg:h-40 object-cover rounded-2xl shadow-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="space-y-6">
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image4}
                          alt="Doctor"
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                        />
                      </div>
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image2}
                          alt="Nurse"
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-6 pt-12">
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image1}
                          alt="Smiling Nurse"
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                        />
                      </div>
                      <div className="transform hover:scale-105 transition-transform duration-300">
                        <Image
                          src={image3}
                          alt="Surgery"
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-[#C3EAE7]/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Comprehensive tools and resources designed specifically for nursing professionals
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  title: 'Learn & Grow',
                  description: 'Access cutting-edge courses and certifications to advance your career',
                  icon: '📚',
                },
                {
                  title: 'On Board',
                  description: 'Find your dream position with our curated job listings',
                  icon: '💼',
                },
                {
                  title: 'Community',
                  description: 'Connect with peers, share experiences, and build your network',
                  icon: '🤝',
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative p-6 lg:p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-[#C3EAE7]/20"
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 bg-[#C3EAE7] rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-black mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm lg:text-base">
                    {feature.description}
                  </p>
                  <div className="mt-6">
                    <button className="text-black font-semibold hover:text-[#C3EAE7] transition-colors duration-200">
                      Learn More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-black">
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
        </section>
        <Footer />

      </main>
    </>
  );
}

export default Home;
