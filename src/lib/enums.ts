export enum Speciality {
  GENERAL_DENTISTRY = 1,
  IMPLANT = 2,
  SURGICAL_XLA = 3,
  ENDODONTICS = 4,
  ORTHODONTIC = 5,
  PERIODONTIC = 6,
  COSMETIC_BONDING_INVISALIGN = 7,
  HYGIENIST = 8,
  RECEPTIONIST = 9,

}

export const SPECIALITY_VALUES = Object.values(Speciality).filter(value => typeof value === 'number');
export const SPECIALITY_KEYS = Object.keys(Speciality);

// Helper function to get display name from numeric value
export const getSpecialityDisplayName = (value: number): string => {
  switch (value) {
    case Speciality.GENERAL_DENTISTRY:
      return "General Dentist";
    case Speciality.IMPLANT:
      return "Implant";
    case Speciality.SURGICAL_XLA:
      return "Surgical Xla";
    case Speciality.ENDODONTICS:  
      return "Endodontics";
    case Speciality.ORTHODONTIC:
      return "Orthodontic";
    case Speciality.PERIODONTIC:
      return "Periodontic";
    case Speciality.COSMETIC_BONDING_INVISALIGN:  
      return "Cosmetic/bonding & Invisalign";
    case Speciality.HYGIENIST:
      return "Hygienist";
    case Speciality.RECEPTIONIST:
      return "Receptionist";
    default:
      return "Unknown";
  }
};

// Helper function to get numeric value from display name
export const getSpecialityValue = (displayName: string): number | null => {
  switch (displayName) {
    case "General Dentist":
      return Speciality.GENERAL_DENTISTRY;
    case "Implant":
      return Speciality.IMPLANT;
    case "Surgical Xla":
      return Speciality.SURGICAL_XLA;
    case "Endodontics":   
      return Speciality.ENDODONTICS;
    case "Orthodontic":
      return Speciality.ORTHODONTIC;
    case "Periodontic":
      return Speciality.PERIODONTIC;
    case "Cosmetic/bonding & Invisalign": 
      return Speciality.COSMETIC_BONDING_INVISALIGN;
    case "Hygienist":
      return Speciality.HYGIENIST;
    case "Receptionist":
      return Speciality.RECEPTIONIST; 
    default:
      return null;
  }
}; 