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
  'forgot-password': {
    title: 'Forgot Password',
    steps: [
      {
        number: 1,
        title: "Click on Forgot Password",
        description: "Click on Forgot Password on the login page",
        instructions: [
          "Click on 'Forgot Password' on the login page",
          "You will be redirected to the forgot password page",
          "Enter your registered email address",
          "Click on 'Reset Password' to reset your password",
          "You will receive an email with a link to reset your password",
          "Click on the link in the email to reset your password",
        ],
        images: ["/images/22.png","/images/23.png", "/images/24.png"]
      },{
        number: 2,
        title: "Reset Password",
        description: "Reset your password",
        instructions: [
          "Click the Reset Password link in the email you received.",
          "You will be redirected to the Reset Password page.",
          "Enter your new password in the first field.",
          "Re-enter the same password in the Confirm Password field",
          "Click Update Password to save your new password",
          "You will be redirected to the login page",
          "Enter your new password",
          "Click on 'Login' to access your account",
        ],
        images: ["/images/26.png","/images/27.png"]
      }

    ],
    importantNotes: [
      "The password reset link is valid for a limited time only. If it expires, you will need to request a new one."
    ]
  },

  'home-dashboard': {
    title: 'Home (Dashboard Overview)',
    steps: [],
    content: [
      {
        title: 'Overview', // Optional section title
        paragraphs: [
          'Once you successfully log in, you will be redirected to the Home page. This dashboard provides a quick overview of your bookings, activity, and account status.',
        ],
        images: ["/images/28.png"] // Optional: add image paths like ["/images/profile1.png"]
      },
      {
        title: 'User Account & Tools',
        paragraphs: [
          '1.Profile Icon - Allows you to view account details and log out',
          '2. Notifications - Keeps you informed about important updates related to your account and bookings.',
          '3. Calendar – View your bookings in a calendar format, including upcoming, confirmed, and past appointments for easy scheduling and tracking.',
          '4. User Guide - Provides step-by-step instructions to help you navigate and use the system effectively.',
          '5. Log Out – Securely sign out of your account and return to the login page.',
        ],
        images: ["/images/29.png"]
      },
      {
        title: 'Navigation Bar',
        paragraphs: [
          '1. Home – Displays an overview of your bookings, activity, and account status.',
          '2. Document Upload – Upload required documents related to your profile.',
          '3. Appointment Requests – View and manage incoming booking requests from clinics.',
          '4. Past Appointments – View details of your completed bookings.',
          '5. My Bookings – View all current, upcoming, and confirmed bookings.',
          '6. Timesheet – Record and manage timesheets for started and completed bookings.',
          '7. Payment – Add and manage your card details and view payment-related information.',

        ],
        images: ["/images/30.png"]
      },
      {
        title: 'Booking Overview',
        paragraphs: [
          '1. Total – Total number of bookings',
          '2. Confirmed – Approved and confirmed bookings',
          '3. Cancelled – Cancelled bookings',
          '4. Past – Completed bookings',

        ],
        images: ["/images/32.png"]
      },
      {
        title: 'Booking Statistics',
        paragraphs: [
          '1. Total Bookings – All bookings made',
          '2. Future & Ongoing Bookings – Upcoming and active bookings',
          '3. Cancelled Bookings – Bookings that were cancelled',
        ],
        images: ["/images/31.png"]
      },
    ],
    importantNotes: []
  },

  'profile': {
    title: 'Profile Man',
    steps: [],
    // Example: Use 'content' field for guide sections without steps
    // content: [
    //   {
    //     title: 'Overview', // Optional section title
    //     paragraphs: [
    //       'Your profile contains important information about your professional background.',
    //       'Keep your profile updated to increase your chances of being selected for appointments.'
    //     ],
    //     images: [] // Optional: add image paths like ["/images/profile1.png"]
    //   }
    // ],
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
  { id: 'forgot-password', title: 'Forgot Password' },
  { id: 'home-dashboard', title: 'Home (Dashboard Overview)' },
  { id: 'profile', title: 'Profile Management' },
  { id: 'settings', title: 'Settings and Preferences' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

