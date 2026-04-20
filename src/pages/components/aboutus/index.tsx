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
                Introduction
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency is a leading dental locum staffing company specialising in matching qualified dental professionals with the staffing needs of dental practices. Our sister company, Lux Dent Agency, was established in 2017, and the concept for this platform was developed by our experienced team in 2018. Although two IT companies failed to complete the project despite significant financial investment, we remained determined and resilient. Rather than giving up, we returned with stronger ideas and embraced the latest technologies to bring our vision to life.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Company Overview
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency provides temporary staffing solutions for dental practices experiencing staff shortages due to maternity leave, illness, annual leave, or other unforeseen circumstances. Our network includes dentists, dental hygienists, dental nurses, and administrative professionals, enabling practices to maintain continuity and efficiency during periods of transition.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                History and Background
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency was founded with the vision of creating a dependable and efficient platform that connects skilled locum dental professionals with practices requiring temporary support. Drawing upon our own experience within the dental locum sector, we recognised the difficulties practices often encounter when seeking suitably qualified temporary staff at short notice. Our aim was to address this gap by delivering a practical, professional, and reliable solution.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Industry Analysis
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                The dental industry faces distinctive staffing challenges, particularly when practices are required to secure qualified professionals within limited timeframes. Laks Dent Agency addresses this growing demand through a streamlined platform that connects practices with experienced, pre-screened dental professionals. This significantly reduces the time, uncertainty, and administrative burden typically associated with temporary recruitment.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Services Offered
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency provides a comprehensive range of services for both dental practices and dental professionals. For practices, we offer access to a broad and diverse pool of temporary staff, tailored to meet specific operational and clinical requirements. For dental professionals, we provide flexible opportunities to work across a variety of practice environments, enabling them to broaden their experience, enhance their skills, and expand their professional networks.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Quality Assurance
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                At Laks Dent Agency, quality assurance is of paramount importance. Every dental professional within our network undergoes a thorough screening and credential verification process. This includes the confirmation of licences, certifications, and professional references, ensuring that only suitably qualified and competent candidates are introduced to practices.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Client Testimonials
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency delivers reliable staffing solutions to both independent dental practices and corporate organisations, supporting the full spectrum of general and specialist dentistry. Our professionals are carefully selected to ensure a smooth integration into each practice, while our strong focus on quality, precision, and client service sets us apart in the sector. As a reference, we provide services to: Perfect Smile, Together Dental, Dental Beauty, The Dental Lounge Wimbledon and many more.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Future Outlook
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                As demand for temporary staffing solutions continues to rise across the dental sector, Laks Dent Agency is strategically positioned for sustained growth and development. With a firm commitment to innovation, service quality, and cost-effectiveness, the company aims to establish itself as one of the most efficient and competitively priced agencies in the UK, creating lasting value for both dental practices and locum nurses.
              </p>
              <h2 className="text-xl lg:text-2xl font-semibold text-black mb-4 mt-6">
                Conclusion
              </h2>
              <p className="text-base lg:text-xl text-gray-700">
                Laks Dent Agency is committed to delivering exceptional temporary staffing solutions tailored to the unique needs of dental practices and dental professionals. Through our dedication to quality, reliability, and outstanding customer service, we are helping to shape the future of temporary staffing within the dental industry
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
