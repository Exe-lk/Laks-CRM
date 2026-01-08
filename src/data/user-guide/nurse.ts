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
      {
        title: 'Activity and History',
        paragraphs: [
          '• Past Bookings – View booking history',
          '• Available Requests – New booking requests available to accept',
          '• Pending Requirements – Items or actions that need your attention',
        ],
        images: ["/images/34.png"]
      },
    ],
    importantNotes: []
  },

  'document-upload': {
    title: 'Document Upload',
    content: [
      {
        title: 'Document Upload Overview',
        paragraphs: [
          'Documents required for verification will vary based on your selected **job type**. These documents are reviewed by the **admin** before your profile is fully approved.',
        ],
      },
      {
        title: 'Steps to Upload Documents:',
        paragraphs: [
          '**Step 1:** Review the list of **required documents** displayed on the page (e.g., GDC Number, Hepatitis B, DBS, Indemnity Insurance, Reference Letters 1, Reference Letters 2, CV, ID, Share Code (Visa Status check), Bank Details, NI/UTR Number)',
          '**Step 2:** To upload a document:',
          '  • Tick the checkbox next to the relevant document.',
          '  • Click **Choose File**.',
          '  • Select the file from your device storage.',
          '',
          '**Supported file formats:** PDF, JPG, JPEG, PNG'
        ],
        images: ['/images/35.png',]
      },
      {
        title: 'Terms and Conditions:',
        paragraphs: [
          'Before submitting, you must agree to the following:',
          '',
          '**Terms and Conditions**',
          '  • Tick "I have read and agree to the Terms and Conditions"',
          '  • Click **Read Full Terms and Conditions** to view the complete document.',
          '  • Add your **digital signature** in the signature field provided.',
          '  • Click **Save** to confirm your signature.',
          '  • A confirmation message will appear:',
          '    ✓ **Terms and Conditions signature saved**',
          '  • If needed, you can click **Clear** to remove the signature and re-enter it before saving again.'
        ],
        images: ['/images/37.png']
      },
      {
        title: 'Privacy Policy:',
        paragraphs: [
          '  • Tick "I have read and agree to the Privacy Policy"',
          '  • Add your **digital signature** in the signature field.',
          '  • Click **Save**.',
          '  • A confirmation message will appear:',
          '    ✓ **Privacy Policy signature saved**',
          '  • You may also use **Clear** to remove and re-enter your signature if required.'
        ],
      },
      {
        title: 'Submit All Documents',
        paragraphs: [
          'Once you have uploaded all required documents and completed the Terms and Conditions and Privacy Policy signatures, click the **Submit All Documents** button at the bottom of the page to complete the document upload process.'
        ],
        images: ['/images/36.png']
      }
    ],
    importantNotes: [
      'All required documents must be uploaded before your profile can be fully approved',
      'Documents must be in the supported formats: PDF, JPG, JPEG, or PNG',
      'Digital signatures are required for both Terms and Conditions and Privacy Policy',
      'You can clear and re-enter signatures if needed before submitting',
      'Once submitted, documents will be reviewed by an admin for approval'
    ]
  },

  'appointment-requests': {
    title: 'Appointment Requests',
    steps: [
      {
        number: 1,
        title: "Appointment Requests Overview",
        description: "The Appointment Requests tab is your central hub for finding and securing new shifts. It is divided into three primary sub-sections: Request Appointment (Finding Jobs), Pending Requests (Tracking Your Applications), and Pending Confirmations (Finalizing Your Shift).",
        instructions: [
          "Request Appointment (Finding Jobs): This is where you browse for available work",
          "Available Requests: Under this sub-tab, you will see a list of jobs available for your role",
          "Pending Requests: Track your applications while waiting for practice review",
          "Pending Confirmations: Finalize your shift after practice acceptance"
        ],
        images: ["/images/38.png"]
      },
      {
        number: 2,
        title: "Request Appointment - Finding Jobs",
        description: "Browse and apply for available appointment requests that match your role and preferences",
        instructions: [
          "Filtering: Use the Distance dropdown to filter jobs (e.g., 'Within 80 km') and click Refresh",
          "Viewing Available Jobs: The table displays available appointments with columns: PRACTICE, REQUEST DATE, START TIME, END TIME, LOCATION, DISTANCE, and ACTION",
          "Each row shows practice details, appointment date and time, location, and distance from you",
          "To apply for an appointment:",
          "  1. View the Practice, Start/End Times, and Location",
          "  2. Click the green Accept button",
          "  3. A 'Confirm Application' pop-up will appear. Click Yes, Apply to send your request to the practice"
        ],
        images: ["/images/39.png", "/images/40.png", "/images/41.png"]
      },
      {
        number: 3,
        title: "Pending Requests - Tracking Your Applications",
        description: "Once you apply, the job moves here while you wait for the practice to review your profile",
        instructions: [
          "Status Alert: You will see a blue banner indicating how many applications are currently pending",
          "Applied Status: The job will show a status of 'Applied' in green. At this stage, you are waiting for the dental practice to 'Confirm' you for the shift",
          "Viewing Your Applications: The table shows: PRACTICE DETAILS, APPOINTMENT (date, time range, location), APPLIED DATE, and STATUS",
          "You can track when you applied and see the current status of each application"
        ],
        images: ["/images/42.png"]
      },
      {
        number: 4,
        title: "Pending Confirmations - Finalizing Your Shift",
        description: "If the practice accepts your application, the job moves to this final step. You are not fully booked until you confirm here",
        instructions: [
          "Final Acceptance:",
          "  1. Click the green Accept button next to the appointment",
          "  2. A 'Confirm Appointment' pop-up will ask: 'Are you sure you want to accept this appointment?'",
          "  3. Click Yes, Accept",
          "Confirmation:",
          "  • A Success! pop-up will appear once the booking is finalized",
          "  • The appointment will be moved to your 'My Bookings' section",
          "  • The pending confirmations count will update accordingly"
        ],
        images: ["/images/43.png", "/images/44.png", "/images/45.png"]
      }
    ],
    importantNotes: [
      "You must have a payment card added before you can apply for appointments",
      "Use the Distance filter to find jobs within your preferred travel distance",
      "Always review practice details, location, and time before accepting",
      "Once you apply, you cannot cancel until the practice responds",
      "You must confirm in 'Pending Confirmations' to finalize your booking",
      "Check back regularly for new available requests"
    ]
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
  { id: 'document-upload', title: 'Document Upload' },
  { id: 'appointment-requests', title: 'Appointment Requests' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

