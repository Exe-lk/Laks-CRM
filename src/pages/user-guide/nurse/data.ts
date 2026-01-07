export const nurseGuideData = {
  'login-registration': {
    title: 'Login and Registration',
    steps: [
      {
        number: 1,
        title: "Access Registration Page",
        description: "Navigate to the platform and access the registration page",
        instructions: [
          "Navigate to the platform homepage",
          "Click on 'Register' in the top navigation menu",
          "Select 'Locum Staff' as your registration type"
        ],
        images: ["/images/1.png", "/images/2.png"]
      },
      {
        number: 2,
        title: "Complete Personal Information",
        description: "Fill in your basic personal details",
        instructions: [
          "Full Name: Enter your full legal name as it appears on official documents",
          "Email Address: Enter a valid email address that you have access to",
          "Contact Number: Enter your 10-digit UK phone number (without country code)",
          "Location: Click the map icon to select your location on the map, then confirm",
          "Address: Enter your complete address including street, city, and postal code"
        ],
        images: ["/images/3.png", "/images/4.png","/images/5.png", "/images/6.png"]
      },
      {
        number: 3,
        title: "Set Up Password",
        description: "Create a secure password for your account",
        instructions: [
          "Password: Create a strong password that contains:",
          "  • At least 6 characters",
          "  • At least one uppercase letter (A-Z)",
          "  • At least one lowercase letter (a-z)",
          "  • At least one number (0-9)",
          "  • At least one special character (!@#$%^&*(),.?\":{}|<>)",
          "Confirm Password: Re-enter your password to confirm it matches"
        ],
        images: ["/images/8.png"]
      },
      {
        number: 4,
        title: "GDC Registration",
        description: "Provide your GDC registration information",
        instructions: [
          "Select whether you have GDC registration:",
          "  • If 'Yes': Enter your GDC Registration Number (4-7 digits)",
          "  • If 'No': Leave the GDC number field empty",
          "Note: GDC registration is required for certain professional roles"
        ],
        images: ["/images/9.png"]
      },
      {
        number: 5,
        title: "Select Job Type",
        description: "Choose your professional role",
        instructions: [
          "Select your job type from the dropdown menu:",
          "  • Nurse",
          "  • Hygienist",
          "  • Receptionist",
          "  • Dentist",
          "The form will update based on your selection"
        ],
        images: ["/images/11.png"]
      },
      {
        number: 6,
        title: "Add Professional Experience",
        description: "Enter your professional experience based on your job type",
        instructions: [
          "For Nurses:",
          "  • Select the dental fields you have experience in (e.g., General Dentist, Implant, Surgical Xla, etc.)",
          "  • For each selected field, enter your years of experience",
          "For Hygienists:",
          "  • Enter your total years of experience as a hygienist",
          "For Receptionists:",
          "  • Enter your years of receptionist experience",
          "  • Enter your software experience (e.g., SOE, R4, Dentally)",
          "For Dentists:",
          "  • Select your specialty areas",
          "  • Enter years of experience for each specialty"
        ],
        images: ["/images/16.png"]
      },
      {
        number: 7,
        title: "Complete reCAPTCHA Verification",
        description: "Verify that you are not a robot",
        instructions: [
          "Complete the reCAPTCHA verification by:",
          "  • Checking the 'I'm not a robot' checkbox",
          "  • Completing any additional verification steps if prompted",
          "Note: Registration cannot be completed without reCAPTCHA verification"
        ],
        images: ["/images/17.png"]
      },
      {
        number: 8,
        title: "Submit Registration",
        description: "Review and submit your registration",
        instructions: [
          "Review all the information you have entered",
          "Ensure all required fields are completed correctly",
          "Click the 'Complete Registration' button",
          "Wait for the confirmation message"
        ],
        images: ["/images/13.png"]
      },
      {
        number: 9,
        title: "Email Verification",
        description: "Verify your email address",
        instructions: [
          "Check your email inbox for a verification email",
          "Click on the verification link in the email",
          "You will be redirected to the verification page",
          "Once verified, you can log in to your account",
          "Note: You must verify your email before you can log in"
        ],
        images: ["/images/16.jpeg", "/images/17.jpeg"]
      },
      {
        number: 10,
        title: "Login to Your Account",
        description: "Access your account after verification",
        instructions: [
          "Navigate to the login page",
          "Enter your registered email address",
          "Enter your password",
          "Click 'Login' to access your dashboard",
          "You can now start browsing and applying for appointments"
        ],
        images: ["/images/21.png"]
      }
    ],
    importantNotes: [
      "All fields marked with * are required and must be filled before submission",
      "Make sure your email address is correct as you will need it for verification",
      "Your password must meet all security requirements for account protection",
      "After registration, check your email and verify your account before logging in",
      "If you encounter any issues during registration, contact support for assistance"
    ]
  },

  // ADD OTHER SECTION CONTENT HERE
  'dashboard': {
    title: 'Dashboard Overview',
    steps: [],
    importantNotes: []
  },

  'appointments': {
    title: 'Finding and Applying for Appointments',
    steps: [],
    importantNotes: []
  },

  'profile': {
    title: 'Profile Management',
    steps: [],
    importantNotes: []
  },

  'settings': {
    title: 'Settings and Preferences',
    steps: [],
    importantNotes: []
  },

  'troubleshooting': {
    title: 'Troubleshooting',
    steps: [],
    importantNotes: []
  }
};

export const sections = [
  { id: 'login-registration', title: 'Login and Registration' },
  { id: 'dashboard', title: 'Dashboard Overview' },
  { id: 'appointments', title: 'Finding and Applying for Appointments' },
  { id: 'profile', title: 'Profile Management' },
  { id: 'settings', title: 'Settings and Preferences' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

