import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/aboutusimage1.jpg"

const Accounting = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-white pt-32">
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                SMALL BUSINESS ACCOUNTANTS
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Business owners, your time is valuable, and business accounting is complex and time-consuming. We have the ideal solution for you......
              </p>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default Accounting;
