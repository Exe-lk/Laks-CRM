import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/MacBook Air - 13.png"

const AboutUs = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-white pt-32">
        <section className="pt-16 lg:pt-20 pb-4 lg:pb-6 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-4 lg:mb-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                About LAKS DENT
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Our objective is to provide you a luxury and quality cost effective service.
              </p>
            </div>
          </div>
          <div className="max-w-5xl mx-auto px-4">
            <Image src={imageAbout} alt="aboutus" width={500} height={500} className="w-full h-full object-cover" />
          </div>
        </section>

        <section className="pt-4 lg:pt-6 pb-16 lg:pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="">
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-2">
                Company Overview
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency provides temporary staffing solutions for dental practices experiencing staff shortages due to maternity leave, illness, annual leave, or other unforeseen circumstances. Our network includes dentists, dental hygienists, dental nurses, and administrative professionals, enabling practices to maintain continuity and efficiency during periods of transition.
              </p>
            </div>
          </div>
        </section>



        <Footer />

      </main>
    </>
  );
}

export default AboutUs;
