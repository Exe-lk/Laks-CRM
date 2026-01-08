import React from 'react';

interface Section {
  id: string;
  title: string;
}

interface UserGuideSidebarProps {
  sections: Section[];
  selectedSection: string;
  onSectionSelect: (sectionId: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const UserGuideSidebar: React.FC<UserGuideSidebarProps> = ({
  sections,
  selectedSection,
  onSectionSelect,
  isOpen = true,
  onClose,
}) => {
  const handleSectionClick = (sectionId: string) => {
    onSectionSelect(sectionId);
    // Close sidebar on mobile after selection
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-[80px] lg:top-32 bottom-0 w-64 bg-white border-r border-gray-200 flex-shrink-0 z-40 overflow-y-auto shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4">
          {/* Mobile Header with Close Button */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="text-lg font-bold text-black px-2">User Guide</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Desktop Header */}
          <h3 className="text-lg font-bold text-black mb-4 px-2 hidden lg:block">
            User Guide
          </h3>

          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  selectedSection === section.id
                    ? 'bg-[#C3EAE7] text-black font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default UserGuideSidebar;

