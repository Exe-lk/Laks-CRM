import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/process.jpg"
import dentalPractices from "../../../../public/assests/practicesdental1.jpg"

const DentalPractices = () => {
  return (
    <>
      <NavBar />

      <main className="min-h-screen bg-white">
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Dental Practices
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Dental Practices - Use LocumLux Search Engine to find your appropriate Locum Nurse in the vicinity.
              </p>
               <div className="max-w-7xl mx-auto px-4">
            <Image src={imageAbout} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
          </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-black mb-4 mt-6">
                !! Do you want to be suprised register and find out more !! 
              </h2>
              <div className="max-w-7xl mx-auto px-4 mb-8">
            <Image src={dentalPractices} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
          </div>
          <div className="grid">
                    <div className="bg-white p-6 rounded-lg shadow-md w-full border border-gray-200"> 
                        <p className="text-base lg:text-xl text-gray-700">
                        !! Let's not compare with other Locum agencies, different agencies have different facilities and advantages. 
                        We are simply using the advance 
                        technology to be more competitive and cost effective to ensure continuity of care at the dental premises with our locum services.                        </p>
                       
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

export default DentalPractices;
