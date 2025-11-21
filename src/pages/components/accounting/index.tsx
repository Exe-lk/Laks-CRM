import Image from 'next/image';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";
import imageAbout from "../../../../public/assests/aboutusimage1.jpg"
import companyRegistration from "../../../../public/assests/accounting/Untitled design.png"
import bookKeeping from "../../../../public/assests/accounting/Untitled design (3).png"
import accounting from "../../../../public/assests/accounting/Untitled design (3).png"
import companyyearend from "../../../../public/assests/accounting/Untitled design (2).png"
import selfaccounting from "../../../../public/assests/accounting/Untitled design (4).png"
import llpaccounts from "../../../../public/assests/accounting/Untitled design (5).png"
import coorparationtax from "../../../../public/assests/accounting/Untitled design (6).png"
import personaltax from "../../../../public/assests/accounting/Untitled design (6).png"
import payeregistration from "../../../../public/assests/accounting/Untitled design (7).png"
import vatregistration from "../../../../public/assests/accounting/Untitled design (8).png"
import vatpreparation from "../../../../public/assests/accounting/Untitled design (9).png"
import filling from "../../../../public/assests/accounting/Untitled design (10).png"

const Accounting = () => {
  const services = [
    { 
      id: 1, 
      image: companyRegistration, 
      title: "Company Registration", 
      description: "Professional company registration services to get your business started" 
    },
    { 
      id: 2, 
      image: bookKeeping, 
      title: "Bookkeeping", 
      description: "Accurate and timely bookkeeping services for your business" 
    },
    { 
      id: 3, 
      image: accounting, 
      title: "Accounting", 
      description: "Comprehensive accounting solutions tailored to your needs" 
    },
    { 
      id: 4, 
      image: companyyearend, 
      title: "Company Year-end Accounts", 
      description: "Expert preparation of annual accounts and financial statements" 
    },
    { 
      id: 5, 
      image: selfaccounting, 
      title: "Self Employed Accounts", 
      description: "Specialized accounting services for self-employed professionals" 
    },
    { 
      id: 6, 
      image: llpaccounts, 
      title: "LLP Accounts", 
      description: "Complete accounting solutions for Limited Liability Partnerships" 
    },
    { 
      id: 7, 
      image: coorparationtax, 
      title: "Corporation Tax (CT600)", 
      description: "Expert corporation tax preparation and filing services" 
    },
    { 
      id: 8, 
      image: personaltax, 
      title: "Personal Tax (SA 100)", 
      description: "Comprehensive personal tax return services" 
    },
    { 
      id: 9, 
      image: payeregistration, 
      title: "PAYE Registration & Management", 
      description: "Complete PAYE registration and payroll management services" 
    },
    { 
      id: 10, 
      image: vatregistration, 
      title: "VAT Registration", 
      description: "Efficient VAT registration and compliance services" 
    },
    { 
      id: 11, 
      image: vatpreparation, 
      title: "VAT Preparation", 
      description: "Accurate VAT return preparation and submission" 
    },
    { 
      id: 12, 
      image: filling, 
      title: "CH & HMRC Filing", 
      description: "Timely filing services for Companies House and HMRC" 
    },
  ];

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

              {/* Services Grid - 4 cards per row */}
              <div className="mt-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="relative h-48 lg:h-56 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-6">
                        <Image 
                          src={service.image} 
                          alt={service.title}
                          width={150}
                          height={150}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="p-5 bg-white">
                        <h3 className="text-lg font-bold text-black mb-3 min-h-[48px] flex items-center justify-center text-center">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 text-center text-sm">
                          {service.description}
                        </p>
                      </div>
                    </div>
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

export default Accounting;
