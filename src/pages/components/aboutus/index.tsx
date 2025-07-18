import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/MacBook Air - 13.png"

const AboutUs = () => {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-white">
        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                About LOCUMLUX
              </h2>
              <p className="text-lg lg:text-xl text-gray-700 max-w-2xl mx-auto">
                Our objective is to provide you a luxury and quality cost effective service.
              </p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4">
            <Image src={imageAbout} alt="aboutus" width={1000} height={1000} className="w-full h-auto" />
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className=" mb-12 lg:mb-16">
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4">
                Introduction
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                LocumLux is a leading dental locum staffing company that specialises in matching dental professionals with dental practices demand. Our
                sister company Lux Dent Agency was founded in 2017 and the experienced staffs have brainstormed that idea since 2018, however, 2 –
                IT companies took away our monies without completing the project.
                We didn't give up and we came back with even better ideas and latest technologies to accomplish that project.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Company Overview
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                LocumLux in providing temporary staffing solutions for dental practices facing staffing shortages due to reasons such as maternity leave, illness, or
                vacation. Their network includes dentists, dental hygienists, dental assistants, and administrative staff,
                ensuring that practices can maintain seamless operations even during staffing transitions.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                History and Background
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                We founded LocumLux with the vision of creating a reliable and efficient platform to matchtalented locum dental professionals
                with practices in need of temporary support. Drawing on our own experiences in the locum dental field, We recognised the challenges
                practices faced when searching for temporary staff and sought to address this gap in the market.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Industry Analysis
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                The dental industry faces unique staffing challenges, with practices often struggling to find qualified professionals to fill temporary positions
                at short notice. LocumLux addresses this need by offering a streamlined platform that connects practices with pre-screened,
                experienced dental professionals, reducing the time and effort involved in the hiring process.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Services Offered
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                LocumLux offers a range of services to both dental practices and dental professionals. For practices, We provide access to a diverse pool of temporary
                staff, tailored to meet specific staffing requirements. For dental professionals, LocumLux offers flexible opportunities to work in various practice
                settings, allowing them to gain valuable experience and expand their professional network.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Quality Assurance
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                LocumLux prioritises quality assurance and ensures that all dental professionals in their network undergo rigorous screening and credentialing processes.
                This includes verifying licenses, certifications, and professional references to guarantee that only
                the most qualified candidates are presented to practices.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Client Testimonials
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                "LocumLux" has been a lifesaver for our practice! Whenever we need temporary staff, they always come through with reliable professionals who
                fit seamlessly into our team. Their attention to detail and commitment to
                customer service are unparalleled." - Dr. Shray Patel at Perfect Smile Parsons Green.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Future Outlook
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                As the demand for temporary staffing solutions continues to grow in the dental industry, LocumLux is poised for expansion. With a focus on innovation
                and customer satisfaction, the company
                plans to enhance its platform with advanced features and tools to further streamline the staffing process for practices and professionals alike.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Conclusion
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Smile Staffing Solutions is committed to providing exceptional temporary staffing solutions that meet the
                unique needs of dental practices and professionals. With a dedication to quality, reliability, and customer service,
                Smile Staffing Solutions is shaping the future of temporary staffing in the dental industry.
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
