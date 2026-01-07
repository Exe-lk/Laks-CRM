import React from 'react';

interface Section {
  id: string;
  title: string;
}

interface UserGuideSidebarProps {
  sections: Section[];
  selectedSection: string;
  onSectionSelect: (sectionId: string) => void;
}

const UserGuideSidebar: React.FC<UserGuideSidebarProps> = ({
  sections,
  selectedSection,
  onSectionSelect,
}) => {
  return (
    <div className="fixed left-0 top-32 bottom-0 w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 z-40 overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-bold text-black mb-4 px-2">User Guide</h3>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                selectedSection === section.id
                  ? 'bg-[#C3EAE7] text-black font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default UserGuideSidebar;

