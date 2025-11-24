import Image from 'next/image';
import { useState, useEffect } from 'react';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/MacBook Air - 17.png"
import dentalNurses1 from "../../../../public/assests/BADN check.jpg"
import dentalNurses2 from "../../../../public/assests/DBS or Disclosure Scotland check.jpg"
import dentalNurses3 from "../../../../public/assests/GDC registration check.jpg"
import dentalNurses4 from "../../../../public/assests/Indemtity Insurance check.jpg"
import dentalNurses5 from "../../../../public/assests/Immunisation check.jpg"


const DentalNurses = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { 
      id: 1, 
      image: dentalNurses1, 
      title: "BADN Check",
      overlayPosition: "bottom-center"
    },
    { 
      id: 2, 
      image: dentalNurses2, 
      title: "DBS or Disclosure Scotland Check",
      overlayPosition: "bottom-center"
    },
    { 
      id: 3, 
      image: dentalNurses3, 
      title: "GDC registration check",
      overlayPosition: "bottom-center"
    },
    { 
      id: 4, 
      image: dentalNurses4, 
      title: "Indemtity Insurance check",
      overlayPosition: "bottom-center"
    },
    { 
      id: 5, 
      image: dentalNurses5, 
      title: "Immunisation Check",
      overlayPosition: "bottom-center"
    },
  ];

  const totalSlides = slides.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Changed to 5 seconds for better engagement

    return () => clearInterval(interval);
  }, [totalSlides]);

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getOverlayPositionClasses = (position: string) => {
    switch(position) {
      case 'top-left':
        return 'top-8 left-8';
      case 'top-right':
        return 'top-8 right-8';
      case 'bottom-left':
        return 'bottom-8 left-8';
      case 'bottom-right':
        return 'bottom-8 right-8';
      case 'bottom-center':
        return 'bottom-8 left-1/2 transform -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-8 left-8';
    }
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
              <h2 className="text-3xl lg:text-4xl text-black text-center mt-12">
              WHY LOCUMLUX?
            </h2>
            <p className="text-base lg:text-xl text-gray-700 text-center max-w-2xl mx-auto mt-4">
              Our agency supplies fully qualified and experienced Locum Dental Nurses and Hygienists to Greater London.
            </p>

            <div className="mt-16 relative">
              <div className="relative h-[350px] lg:h-[450px] flex items-center justify-center overflow-visible">
                <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center">
                  {slides.map((slide, index) => {
                    const position = index - currentSlide;
                    const isActive = position === 0;
                    const isPrev = position === -1;
                    const isNext = position === 1;
                    const isVisible = Math.abs(position) <= 1;

                    return (
                      <div
                        key={slide.id}
                        className={`absolute transition-all duration-700 ease-in-out ${
                          !isVisible ? 'opacity-0 pointer-events-none' : ''
                        }`}
                        style={{
                          transform: `translateX(${position * 70}%) scale(${isActive ? 1 : 0.75})`,
                          zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                        }}
                      >
                        <div className={`relative w-[280px] lg:w-[400px] h-[300px] lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 ${
                          !isActive ? 'blur-sm opacity-60' : ''
                        }`}>
                          <Image 
                            src={slide.image} 
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>
                          {isActive && (
                            <div className={`absolute ${getOverlayPositionClasses(slide.overlayPosition)} w-[calc(100%-2rem)] max-w-md z-10`}>
                              <div className="bg-[#2c3e7e]/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-xl">
                                <h3 className="text-base lg:text-xl font-bold text-white text-center">
                                  {slide.title}
                                </h3>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={prevSlide}
                  className="absolute left-0 lg:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-2 lg:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="Previous slide"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 lg:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/90 hover:bg-white text-gray-800 p-2 lg:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  aria-label="Next slide"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="flex justify-center items-center mt-8 space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`rounded-full transition-all duration-500 ${
                      currentSlide === index 
                        ? 'w-12 h-3 bg-gradient-to-r from-pink-500 to-rose-500' 
                        : 'w-3 h-3 bg-gray-300 hover:bg-gray-400 hover:scale-125'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={currentSlide === index ? 'true' : 'false'}
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
