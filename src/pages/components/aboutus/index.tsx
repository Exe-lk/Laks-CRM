import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";

const Home = () => {
  return (
    <>
      <NavBar />
      
      <main className="min-h-screen bg-white">
        <section className="py-16 lg:py-20 bg-[#C3EAE7]/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                About LOCUMLUX
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
               Our objective is to provide you a luxury and quality cost effective service. 
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
