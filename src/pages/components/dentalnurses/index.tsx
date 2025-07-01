import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/process.jpg"

const DentalNurses = () => {
  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white">
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
              <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 mt-6">
              Great things in business are never done by one person. 
              They're done by a team of people. Let's work together and build up your profile for better Pay ((£))
              </h2>
            </div>
          </div>
        </section>
        <section className="py-16 lg:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl lg:text-4xl text-black mb-4 mt-6 text-center">
                WHY LOCUMLUX?
                </h2>
                <p className="text-base lg:text-xl text-gray-700 text-center">
                    Our agency supplies fully qualified and experienced Locum Dental Nurses and Hygienists to Greater London.
                </p>
                </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default DentalNurses;
