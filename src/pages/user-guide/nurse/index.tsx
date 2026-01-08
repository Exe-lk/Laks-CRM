import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Logo from "../../../../public/assests/Laks Dent Logo.png";
import NavBar from '../../components/navBar/nav';
import { nurseGuideData, sections } from '@/data/user-guide/nurse';
import UserGuideSidebar from '@/components/UserGuideSidebar';

const NurseUserGuide = () => {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState('login-registration');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentContent = nurseGuideData[selectedSection as keyof typeof nurseGuideData];
  const hasSteps = currentContent?.steps && currentContent.steps.length > 0;
  const hasContent = currentContent && 'content' in currentContent && Array.isArray((currentContent as any).content) && (currentContent as any).content.length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavBar />
      
      <div className="pt-20 lg:pt-36 pb-16 flex flex-1 relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed top-24 left-3 sm:left-4 z-40 lg:hidden bg-[#C3EAE7] hover:bg-[#A9DBD9] text-black p-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg ${
            isSidebarOpen ? 'hidden' : 'flex items-center justify-center'
          }`}
          aria-label="Open sidebar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Left Sidebar */}
        <UserGuideSidebar
          sections={sections}
          selectedSection={selectedSection}
          onSectionSelect={setSelectedSection}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right Content Area */}
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 lg:ml-64 pt-12 lg:pt-0"
          onClick={() => {
            if (isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsSidebarOpen(false);
            }
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-8">
                {currentContent?.title}
              </h2>
              
              {hasSteps ? (
                currentContent.steps.map((step, index) => (
                  <div key={step.number} className={`mb-16 ${index !== currentContent.steps.length - 1 ? 'border-b-2 border-gray-200 pb-16' : ''}`}>
                    <div className="flex flex-col lg:flex-row items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-[#C3EAE7] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-3xl font-bold text-black">{step.number}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-black mb-3">
                          Step {step.number}: {step.title}
                        </h3>
                        
                        {step.description && (
                          <p className="text-gray-600 mb-4 text-base sm:text-lg">
                            {step.description}
                          </p>
                        )}
                        
                        {step.instructions && step.instructions.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h4 className="font-semibold text-black mb-3">Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm sm:text-base">
                              {step.instructions.map((instruction, idx) => (
                                <li key={idx} className="leading-relaxed">{instruction}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        
                        {step.images && step.images.length > 0 && (
                          <div className="grid grid-cols-1 gap-8">
                            {step.images.map((imagePath, imgIdx) => (
                              <div key={imgIdx} className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4">
                                <div className="relative w-full bg-white flex items-center justify-center min-h-[400px]">
                                  <Image
                                    src={imagePath}
                                    alt={`Step ${step.number} - Image ${imgIdx + 1}`}
                                    width={1600}
                                    height={1200}
                                    className="w-full h-auto object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      const parent = target.parentElement;
                                      if (parent) {
                                        parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Image not found</div>';
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : hasContent && 'content' in currentContent ? (
                <div className="space-y-8">
                  {((currentContent as any).content as any[]).map((section: any, index: number) => (
                    <div key={index} className={`${index !== ((currentContent as any).content as any[]).length - 1 ? 'border-b-2 border-gray-200 pb-8' : ''}`}>
                      {section.title && (
                        <h3 className="text-xl sm:text-2xl font-bold text-black mb-4">
                          {section.title}
                        </h3>
                      )}
                      
                      {section.paragraphs && section.paragraphs.length > 0 && (
                        <div className="space-y-4 mb-6">
                          {section.paragraphs.map((paragraph: string, pIdx: number) => (
                            <p key={pIdx} className="text-gray-700 text-base sm:text-lg leading-relaxed">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      )}
                      
                      {section.images && section.images.length > 0 && (
                        <div className="grid grid-cols-1 gap-8 mt-6">
                          {section.images.map((imagePath: string, imgIdx: number) => (
                            <div key={imgIdx} className="bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow p-4">
                              <div className="relative w-full bg-white flex items-center justify-center min-h-[400px]">
                                <Image
                                  src={imagePath}
                                  alt={section.title ? `${section.title} - Image ${imgIdx + 1}` : `Image ${imgIdx + 1}`}
                                  width={1600}
                                  height={1200}
                                  className="w-full h-auto object-contain"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Image not found</div>';
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-lg">
                    Content for this section is coming soon...
                  </p>
                </div>
              )}
            </div>

            {currentContent?.importantNotes && currentContent.importantNotes.length > 0 && (
              <div className="bg-[#C3EAE7]/10 rounded-xl p-8 sm:p-12 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-black mb-6">
                  Important Notes
                </h2>
                <ul className="space-y-4 text-gray-700 text-base sm:text-lg">
                  {currentContent.importantNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-[#C3EAE7] font-bold mr-3">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NurseUserGuide;
