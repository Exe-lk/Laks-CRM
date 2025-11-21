import Image from 'next/image';
import { useState, useEffect } from 'react';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/MacBook Air - 17.png"
import dentalNurses1 from "../../../../public/assests/dentalnurses/pexels-cedric-fauntleroy-4269689.jpg"
import dentalNurses2 from "../../../../public/assests/dentalnurses/pexels-cedric-fauntleroy-4269692.jpg"
import dentalNurses3 from "../../../../public/assests/dentalnurses/pexels-cedric-fauntleroy-4269694.jpg"
import dentalNurses4 from "../../../../public/assests/dentalnurses/pexels-cedric-fauntleroy-4269696.jpg"
import dentalNurses5 from "../../../../public/assests/dentalnurses/pexels-cottonbro-6502307.jpg"
import dentalNurses6 from "../../../../public/assests/dentalnurses/pexels-pavel-danilyuk-6809652.jpg"
import dentalNurses7 from "../../../../public/assests/dentalnurses/pexels-shvetsa-3845745.jpg"


const DentalNurses = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const cards = [
    { id: 1, image: dentalNurses1, title: "Professional Care", description: "Experienced dental nurses providing top-quality care" },
    { id: 2, image: dentalNurses2, title: "Expert Team", description: "Qualified professionals dedicated to your practice" },
    { id: 3, image: dentalNurses3, title: "Quality Service", description: "Reliable and skilled dental nursing services" },
    { id: 4, image: dentalNurses4, title: "Patient Focus", description: "Compassionate care for every patient" },
    { id: 5, image: dentalNurses5, title: "Modern Techniques", description: "Up-to-date with latest dental practices" },
    { id: 6, image: dentalNurses6, title: "Team Support", description: "Supporting your practice with excellence" },
    { id: 7, image: dentalNurses7, title: "Trusted Professionals", description: "Certified and experienced dental nurses" },
  ];

  const cardsPerSlide = 3;
  const totalSlides = Math.ceil(cards.length / cardsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 10000);

    return () => clearInterval(interval);
  }, [totalSlides]);

  const getCurrentCards = () => {
    const startIndex = currentSlide * cardsPerSlide;
    return cards.slice(startIndex, startIndex + cardsPerSlide);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white pt-32">
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Dental Nurses
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Use LocumLux Network to find Dental Practices.
              </p>
              <div className="max-w-7xl mx-auto px-4">
                <Image src={imageAbout} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-black">
                Great things in business are never done by one person.
                They're done by a team of people. Let's work together and build up your profile for better Pay ((£))
              </h2>
              <h2 className="text-3xl lg:text-4xl text-black text-center mt-6">
              WHY LOCUMLUX?
            </h2>
            <p className="text-base lg:text-xl text-gray-700 text-center max-w-2xl mx-auto mt-4">
              Our agency supplies fully qualified and experienced Locum Dental Nurses and Hygienists to Greater London.
            </p>

            {/* Auto-rotating Slider */}
            <div className="mt-16 relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {getCurrentCards().map((card, index) => (
                  <div 
                    key={card.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105"
                    style={{
                      animation: 'fadeIn 0.5s ease-in-out'
                    }}
                  >
                    <div className="relative h-64 lg:h-80">
                      <Image 
                        src={card.image} 
                        alt={card.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-black mb-2">
                        {card.title}
                      </h3>
                      <p className="text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default DentalNurses;
