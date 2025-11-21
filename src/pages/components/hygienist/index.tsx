import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/MacBook Air - 17.png"
import imagechart from "../../../../public/assests/nurses3.jpg"


const Hygienist = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-white pt-32">
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                Hygienist
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Use LocumLux Network for work.
              </p>
              <div className="max-w-7xl mx-auto px-4">
                <Image src={imageAbout} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
              </div>
              <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 mt-6">
                Great things in business are never done by one person.
                They're done by a team of people. Let's work together and build up your profile for better Pay ((£))
              </h2>
              <div className="max-w-7xl mx-auto px-4">
                <Image src={imagechart} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
              </div>
              <div className="grid mt-10">
                <div className="bg-white p-6 rounded-lg shadow-md w-full border border-gray-200">
                  <p className="text-base lg:text-xl text-gray-700">
                    !! Let's not compare with other Locum agencies, different agencies have different facilities and advantages. We are simply using the advance technology to be more
                    competitive and cost effective to ensure continuity of care at the dental premises with our locum services.    </p>

                </div>
              </div>
              <h2 className="text-base lg:text-base text-black text-center mt-12 font-bold">
              Do you want to be surprised register and find out more.
              </h2>
              <h2 className="text-base lg:text-base text-black text-center max-w-2xl mx-auto mt-2">
              High profile Locum Nurses              </h2>
              <h2 className="text-base lg:text-base text-black text-center max-w-2xl mx-auto mt-2">
              Our competitive fee              </h2>
              <h2 className="text-base lg:text-base text-black text-center max-w-2xl mx-auto mt-2">Available 24/7</h2>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default Hygienist;
