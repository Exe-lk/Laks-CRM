export enum Speciality {
  SURGICAL_XLA = 1,
  ENDODONTICS = 2,
  ORTHODONTIC = 3,
  PERIODONTIC = 4,
  COSMETIC_BONDING_INVISALIGN = 5,
  GENERAL_DENTISTRY = 6,
  ORAL_SURGERY = 7,
  IMPLANT = 8,
  HYGIENIST = 9,
  RECEPTIONIST=10,

}

export const SPECIALITY_VALUES = Object.values(Speciality).filter(value => typeof value === 'number');
export const SPECIALITY_KEYS = Object.keys(Speciality);

// Helper function to get display name from numeric value
export const getSpecialityDisplayName = (value: number): string => {
  switch (value) {
    case Speciality.SURGICAL_XLA:
      return "Surgical xla";
    case Speciality.ENDODONTICS:
      return "Endodontics";
    case Speciality.ORTHODONTIC:
      return "Orthodontic";
    case Speciality.PERIODONTIC:
      return "Periodontic";
    case Speciality.COSMETIC_BONDING_INVISALIGN:
      return "Cosmetic/bonding & Invisalign";
    case Speciality.ORAL_SURGERY:
      return "Oral Surgery";
    case Speciality.GENERAL_DENTISTRY:
      return "General Dentistry";
    case Speciality.IMPLANT:
      return "Implant";
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
    case "Surgical xla":
      return Speciality.SURGICAL_XLA;
    case "Endodontics":
      return Speciality.ENDODONTICS;
    case "Orthodontic":
      return Speciality.ORTHODONTIC;
    case "Periodontic":
      return Speciality.PERIODONTIC;
    case "Cosmetic/bonding & Invisalign":
      return Speciality.COSMETIC_BONDING_INVISALIGN;
    case "Oral Surgery":
      return Speciality.ORAL_SURGERY;
    case "General Dentistry":
      return Speciality.GENERAL_DENTISTRY;
    case "Implant":
      return Speciality.IMPLANT;
    case "Hygienist":
      return Speciality.HYGIENIST;
    case "Receptionist":
      return Speciality.RECEPTIONIST;
    default:
      return null;
  }
}; 