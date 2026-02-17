export const practiceGuideData = {
  'login-registration': {
    title: 'Login and Registration',
    steps: [
      {
        number: 1,
        title: "Access Registration Page",
        description: "To access the registration page of the Laks Dent platform, users should visit the official website and follow these steps:",
        instructions: [
          "Access the Website: Navigate to https://www.laksdentagency.co.uk/ on your mobile browser",
          "Open the Menu: Tap the hamburger menu icon (three horizontal lines) in the top right corner of the screen",
          "Click Register: Tap the 'Register' button highlighted at the bottom of the menu list"
        ],
        images: ["/images/1.jpeg","/images/2.jpeg",]
      },
      {
        number: 2,
        title: "Select Registration Type",
        description: "Choose your registration type from the pop-up window",
        instructions: [
          "A pop-up window will appear asking 'Do you want to register as a...'",
          "Select 'Individual Practice / Corporate Practices' as your registration type",
          "This option is for dental practices that want to register on the platform"
        ],
        images: ["/images/75.jpeg"]
      },
      {
        number: 3,
        title: "Complete Personal Information",
        description: "Fill in your basic personal and practice details",
        instructions: [
          "Name: Enter your full legal name as it appears on official documents",
          "Telephone: Provide your contact number (10-digit format)",
          "Email Address: Use your official professional email for account management",
          "Date of Birth: Provide your date of birth"
        ],
        images: ["/images/76.png"]
      },
      {
        number: 4,
        title: "Set Up Password",
        description: "Create a secure password for your account",
        instructions: [
          "Password: Create a strong password (minimum 6 characters)",
          "The password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
          "Confirm Password: Re-enter the same password to confirm",
          "Click the eye icon to show or hide the password you have entered"
        ],
        images: ["/images/8.png"]
      },
      {
        number: 5,
        title: "GDC Registration",
        description: "Provide your GDC registration information",
        instructions: [
          "GDC Registration: Select 'Yes' or 'No' from the dropdown menu",
          "GDC Registration Number: Enter your official GDC registration number (required if GDC Registration = Yes)",
          "If you selected 'Yes', you must provide your GDC registration number",
          "If you selected 'No', you can leave the GDC number field empty"
        ],
        images: ["/images/9.png"]
      },
      {
        number: 6,
        title: "Complete reCAPTCHA Verification and Submit Registration",
        description: "Verify that you are not a robot and submit your registration",
        instructions: [
          "Tick the 'I'm not a robot' checkbox to verify that you are a human user before proceeding",
          "Complete any additional reCAPTCHA verification steps if prompted",
          "Review the Terms and Conditions and Privacy Policy by clicking on the bold links before completing your registration",
          "After filling in all required fields and completing the verification, click the 'Complete Registration' button to submit your details",
          "Note: Registration cannot be completed without reCAPTCHA verification",
          "Already registered? Click 'Login here' to access your account or 'Back to Home' to return to the homepage"
        ],
        images: ["/images/17.png"]
      },
      {
        number: 7,
        title: "Registration Success",
        description: "Confirm your registration was successful",
        instructions: [
          "Once registration is complete, a confirmation pop-up will appear informing you that your registration was successful",
          "The pop-up will display: 'Registration completed successfully! Please check your email to verify your account before logging in.'",
          "Click the 'OK' button to dismiss the pop-up",
          "Important: You will be asked to check your email to verify your account before logging in",
          "The verification link is valid for 10 minutes only",
          "A new verification link cannot be requested",
          "If you do not see the email in your inbox, please check your Spam or Junk folder"
        ],
        images: ["/images/13.png"]
      },
      {
        number: 8,
        title: "Check Your Email for Verification",
        description: "Open the confirmation email sent to your registered email address",
        instructions: [
          "Once registration is completed, a confirmation email will be sent to the registered email address",
          "Open your email inbox and look for an email titled 'Confirm Your Signup'",
          "The email will be from 'Laks Dent Agency'",
          "If you do not see the email in your inbox, check your Spam or Junk folder",
          "Note: The verification link in the email is valid for 10 minutes only"
        ],
        images: ["/images/78.jpeg",]
      },
      {
        number: 9,
        title: "Confirm Your Email Address",
        description: "Click the confirmation button or link in the email to verify your account",
        instructions: [
          "Open the email from 'Laks Dent Agency' with the subject 'Confirm Your Signup'",
          "Read the email content which will welcome you to Locum Lux and explain that you need to confirm your email address",
          "Click the 'Confirm your mail' button inside the email (this is the primary method)",
          "Note: If the confirmation button does not work, you may use the alternative confirmation link provided in the email",
          "After clicking the confirmation button or link, you will be redirected and your email will be verified",
          "Once verified, you can proceed to log in to your account"
        ],
        images: ["/images/77.jpeg"]
      },
      {
        number: 10,
        title: "Navigate to Login Page",
        description: "Access the login page from the homepage after email verification",
        instructions: [
          "After confirming your email, you will be redirected to the Home page",
          "Tap the hamburger menu icon (three horizontal lines) in the top right corner of the screen",
          "Click 'Login' from the menu options that appear in the sidebar",
          "You will be redirected to the Login page"
        ],
        images: ["/images/80.jpeg"]
      },
      {
        number: 11,
        title: "Login to Your Account",
        description: "Sign in to your practice account and understand the admin approval process",
        instructions: [
          "A pop-up window will appear asking 'Do you want to login as a...'",
          "Select 'Individual Practice' from the pop-up options (or 'Corporate Practice' if applicable)",
          "Enter your registered email address in the 'Email Address' field",
          "Enter your password in the 'Password' field",
          "You can click the eye icon to show or hide your password",
          "Before signing in, tick the 'I'm not a robot' checkbox to verify you are human",
          "Click the 'Sign In' button to access your account",
          "Important: Once your account is created successfully and you have confirmed your email, your account will still need to be approved by the admin before you can log in",
          "If your account is pending approval, you will see a 'Pending Approval' message indicating that your account is awaiting administrative review",
          "Once approved by the admin, you will be able to log in and start using the platform"
        ],
        images: ["/images/practice/step12-login.png", "/images/practice/step12-pending-approval.png"]
      }
    ],
    importantNotes: [
      "All fields marked with * are required and must be filled before submission",
      "Make sure your email address is correct as you will need it for verification",
      "Your password must meet all security requirements for account protection",
      "After registration, check your email and verify your account before logging in",
      "The verification link in the email is valid for 10 minutes only",
      "A new verification link cannot be requested, so check your email promptly",
      "If you do not see the verification email in your inbox, please check your Spam or Junk folder",
      "You must verify your email address before you can log in to your account",
      "Once your account is created successfully and you have confirmed your email, your account will still need to be approved by the admin before you can log in",
      "You will see a 'Pending Approval' message after attempting to sign in if your account is awaiting admin approval",
      "Once approved by the admin, you will be able to log in and start using the platform",
      "If you encounter any issues during registration or login, contact support for assistance"
    ]
  },

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
        images: ["/images/22.png", "/images/23.png"]
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
        images: ["/images/26.png"]
      }

    ],
    importantNotes: [
      "The password reset link is valid for a limited time only. If it expires, you will need to request a new one."
    ]
  },
  'home-overview': {
    title: 'Home Overview',
    steps: [],
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'Once you successfully log in, you will be redirected to the Home page. This dashboard provides a quick overview of your bookings, activity, and account status.',
        ],
        images: ["/images/81.png"]
      },
      {
        title: 'User Account & Tools',
        paragraphs: [
          '1. Profile Icon - Allows you to view account details and log out',
          '2. Notifications - Keeps you informed about important updates related to your account and bookings',
          '3. Calendar – View your bookings in a calendar format, including upcoming, confirmed, and past appointments for easy scheduling and tracking',
          '4. User Guide - Provides step-by-step instructions to help you navigate and use the system effectively',
          '5. Log Out – Securely sign out of your account and return to the login page',
        ],
        images: ["/images/practice/user-account-tools.png"]
      },
      {
        title: 'Navigation Bar',
        paragraphs: [
          'Home – Displays an overview of your bookings, activity, and account status',
          'Appointments – Create and manage bookings',
          'My Bookings – View all past, current, upcoming, and confirmed bookings',
          'Payment – Add and manage your card details and view payment-related information',
        ],
        images: ["/images/practice/navigation-bar.png"]
      },
      {
        title: 'Activity & History',
        paragraphs: [
          'This section helps track your activity:',
          '',
          '**Past Bookings** – View booking history',
          '  • Click "View History →" to see your completed bookings',
          '',
          '**Available Requests** – New booking requests available to accept',
          '  • Click "View Details →" to see new booking requests',
          '',
          '**Pending Requirements** – Items or actions that need your attention',
          '  • Click "View Details →" to see pending items that require action',
        ],
        images: ["/images/practice/activity-history.png"]
      },
    ],
    importantNotes: []
  },

  'booking-overview': {
    title: 'Booking Overview',
    steps: [],
    content: [
      {
        title: 'Booking Overview',
        paragraphs: [
          'Total – Total number of bookings',
          'Confirmed – Approved and confirmed bookings',
          'Cancelled – Cancelled bookings',
          'Past – Completed bookings',
        ],
        images: ["/images/28.png"]
      },
      {
        title: 'Booking Statistics',
        paragraphs: [
          'This area shows detailed booking status cards:',
          '',
          '**Total Bookings** – All bookings made',
          '  • Click "View All →" to see all your bookings',
          '',
          '**Future & Ongoing Bookings** – Upcoming and active bookings',
          '  • Click "View Ongoing →" to see your upcoming and active bookings',
          '',
          '**Cancelled Bookings** – Bookings that were cancelled',
          '  • Click "View Cancelled →" to see all cancelled bookings',
          '',
          'Each card includes a View option to see detailed information.',
        ],
        images: ["/images/practice/booking-statistics.png"]
      }
    ],
    importantNotes: []
  },

  'footer-section': {
    title: 'Footer Section',
    steps: [],
    content: [
      {
        title: 'Footer Section',
        paragraphs: [
          'At the bottom of the page, you will find "Quick Access" (shortcuts to important sections like the dashboard) and "Contact Us" (office address, phone number, and email details).',
          '',
          '**Company Information:**',
          '  • Locum Lux is a trading name & owned by LUX DENT AGENCY LIMITED',
          '  • Company no: 10800218',
          '  • Registered in England and Wales',
          '',
          '**Quick Access:**',
          '  • **Home** – Monitor practice performance and requests',
          '  • **My Bookings** – Track locum bookings in one place',
          '  • **Payments** – Review invoices and transactions',
          '',
          '**Contact Us:**',
          '  • **Office Address:** 61 Griffiths Road, Wimbledon, London, England, SW19 1ST',
          '  • **Phone Number:** +44 7490 714868',
          '  • **Email:** info@locumlux.co.uk',
          '',
          '**Follow Us:**',
          '  • Connect with us on social media: Facebook, Twitter, LinkedIn, and Pinterest',
          '',
          '**Legal Links:**',
          '  • Terms and Conditions',
          '  • Privacy Policy',
          '  • Cookie Policy',
          '',
          '**Copyright:**',
          '  • © 2025 Locum Lux. All rights reserved.',
          '',
          'This dashboard allows you to **quickly monitor bookings, manage appointments, and access important sections** of your account efficiently.',
        ],
        images: ["/images/practice/footer-section.png"]
      }
    ],
    importantNotes: []
  },

  'essential-payment-setup': {
    title: 'Essential Payment Setup',
    content: [
      {
        title: 'Payment Requirement',
        paragraphs: [
          'You cannot apply for any appointments until a valid payment method is added to your account.'
        ],
        images: ['/images/41.jpeg']
      },
      {
        title: 'Payment Alert',
        paragraphs: [
          'If your payment details are missing, a red dot will appear next to the Payment tab in the hamburger menu as a reminder.'
        ],
        images: ['/images/40.jpeg']
      },
      {
        title: 'Application Block',
        paragraphs: [
          'If you attempt to tap "Apply Now" on a shift without a card on file, a "Payment Card Required" pop-up will appear.'
        ],
        images: ['/images/40.jpeg']
      },
      {
        title: 'Direct Access',
        paragraphs: [
          'You can click the red "Add Payment Card" button directly on an appointment listing if you have not yet added your details.'
        ],
        images: ['/images/42.jpeg']
      },
      {
        title: 'Adding a Card',
        paragraphs: [
          '1. Tap "Yes, Add Payment Card" from the alert or go to the Payment tab.',
          '2. Enter the **Card Holder Name** and **Card Details (Number, MM/YY, and CVC)**.',
          '3. Check "Set as default payment method" and tap "Add Card".',
          '4. Wait for the "Adding Card..." secure processing to finish.',
          '5. A "Success!" message will confirm your payment method is ready.'
        ],
        images: ['/images/43.jpeg', '/images/44.jpeg']
      }
    ],
    importantNotes: [
      'You must add a valid payment method before applying for any appointments',
      'The red dot indicator on the Payment tab will remind you to add your payment details',
      'You can add a payment card directly from the appointment listing or from the Payment tab',
      'All payment information is securely processed',
      'You can set your preferred card as the default payment method'
    ]
  },

  'enabling-push-notifications': {
    title: 'Enabling Push Notifications',
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'Because Laks Dent is a Progressive Web App (PWA), you must "install" it to your device to receive alerts.'
        ]
      },
      {
        title: 'For iOS (iPhone/iPad)',
        paragraphs: [
          '**Step 1: Open Safari**',
          'Navigate to the Laks Dent website at https://www.laksdentagency.co.uk/.',
          '',
          '**Step 2: Access Share Menu**',
          'Tap the Share icon at the bottom of the browser, then click "More" if necessary to see all actions.'
        ],
        images: ['/images/65.jpeg','/images/66.jpeg']
      },
      {
        title: 'Add to Home Screen',
        paragraphs: [
          '**Step 3: Select "Add to Home Screen"**',
          'From the Share menu, scroll down and select **"Add to Home Screen"**.',
          '',
          '**Step 4: Confirm Installation**',
          'Ensure "Open as Web App" is toggled on and tap **"Add"** to place the Laks Dent icon on your device\'s home screen.',
          '',
          '**Step 5: Grant Permission**',
          'Open the newly installed app from your home screen; a prompt will appear asking to "Allow" notifications—select **Allow**.',
          '',
          '**Step 6: Locate the App**',
          'The Laks Dent icon will now appear on your home screen like a standard app.'
        ],
        images: ['/images/68.jpeg','/images/69.jpeg']
      },
      {
        title: 'Important',
        paragraphs: [
          'Your device must be running **iOS 16.4 or later** for PWA notification features to be supported.'
        ]
      },
      {
        title: 'For Android',
        paragraphs: [
          '**Step 1:** Open the site in Chrome and tap the **three dots** in the top right.',
          '',
          '**Step 2:** Select **"Install App"** or **"Add to Home Screen"**.',
          '',
          '**Step 3:** Accept the permission prompt when the app asks to send notifications.'
        ],
      },
      {
        title: 'What Notifications Will You Receive?',
        paragraphs: [
          'The system uses real-time alerts to ensure a smooth workflow between Staff and Practices:',
          '',
          '**Booking Alerts:** Receive immediate updates when a practice confirms your application.'
        ],
        images: ['/images/70.jpeg']
      }
    ],
    importantNotes: [
      'Laks Dent is a Progressive Web App (PWA) that must be installed to receive notifications',
      'iOS devices must be running iOS 16.4 or later for PWA notification support',
      'You must grant notification permissions when prompted after installation',
      'The app icon will appear on your home screen like a standard app',
      'Notifications provide real-time updates about booking confirmations and other important events',
      'Make sure to allow notifications when the app first requests permission'
    ]
  },

  'appointments': {
    title: 'Managing Appointments',
    steps: [],
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'The **Appointments** section allows you to create and manage appointment requests for locum staff. This section is divided into two main areas:',
          '',
          '**Create Appointment Request:** Schedule your appointment by filling out the form below with all required details.',
          '',
          '**Your Appointment Requests:** Manage and track your appointments in a table format showing Date & Time, Location, Required Role, Status, Applicants, Selection, and Actions.',
        ],
        images: ["/images/practice/appointments-overview.png"]
      },
      {
        title: 'Creating a New Appointment Request',
        paragraphs: [
          'To create a new appointment request, click the green **"+ Create New Appointment"** button.',
          '',
          'When you click the green **+ Create New Appointment** button, the Create Appointment Request form opens as a dedicated window.',
        ],
        images: ["/images/practice/create-appointment-button.png"]
      },
      {
        title: 'Filling Out the Appointment Form',
        paragraphs: [
          'The Create Appointment Request form contains the following required fields:',
          '',
          '**Request Date:** Select the specific day you need coverage using the date picker (dd/mm/yyyy format).',
          '',
          '**Time Window:** Enter the Start Time and End Time. Note that appointments must be at least 30 minutes long.',
          '  • If the time difference is less than 30 minutes, you will see an error message: "Appointment must be at least 30 minutes long"',
          '',
          '**Location:** The location is automatically set to your practice address for Private practices. This field is pre-filled and cannot be changed for individual practices.',
          '',
          '**Role:** Choose the required professional from the dropdown: Nurse, Receptionist, Hygienist, or Dentist.',
          '',
          'Once all fields are completed, click **"Create Request"** to publish the shift, or **"Cancel"** to discard the form.',
        ],
        images: ["/images/practice/appointment-form.png", "/images/practice/time-window-role.png"]
      },
      {
        title: 'Publishing Your Request',
        paragraphs: [
          'Click **"Create Request"** to make the shift live for locum staff to see.',
          '',
          'Once you have submitted your request by clicking Create Request, it will immediately appear in your **Appointment Requests** table for tracking and management.',
        ],
        images: ["/images/practice/publish-request.png"]
      },
      {
        title: 'Understanding Your Appointment Table',
        paragraphs: [
          'The table provides a live overview of your shift\'s lifecycle:',
          '',
          '**Immediate Visibility:** Your new request appears with its unique **Appointment ID**, scheduled **Date & Time**, and the **Required Role**.',
          '',
          '**Location Confirmation:** For individual practices, the location is fixed to your registered clinic address.',
          '',
          '**Initial Status:** Every new request starts with a yellow **PENDING** status badge, indicating it is live and waiting for applicants.',
          '',
          '**Applicant Tracking:** The **Applicants** column will initially show **0** but will update in real-time as locum staff apply.',
          '',
          '**Selection Status:** Initially shows "No selection" until applicants apply. Once locum staff members apply, the "No selection" text is replaced by a green **Select Applicant** button.',
        ],
        images: ["/images/practice/appointment-table.png"]
      },
      {
        title: 'Auto-Selection vs Manual Selection',
        paragraphs: [
          'After clicking the green **Select Applicant** button, you enter the decision phase of your booking.',
          '',
          'The system automatically detects how many professionals have applied for your shift:',
          '',
          '**Auto-Selection (Fastest):**',
          '  • If only one applicant is available, a pop-up will appear asking: "There is only one applicant available: [Name]. Would you like to select them automatically?"',
          '  • Clicking **"Yes, Auto-Select"** immediately assigns the professional to the shift.',
          '  • This is the fastest way to fill a shift when only one person has applied.',
          '',
          '**Manual Selection (More Control):**',
          '  • If you click **"Let me choose manually"** on the auto-select prompt or have multiple applicants, the full list will open.',
          '  • This allows you to review and compare all applicants before making a decision.',
        ],
        images: ["/images/practice/auto-selection-popup.png"]
      },
      {
        title: 'Evaluating Applicants',
        paragraphs: [
          'When the Locum Staffs list opens, you can evaluate each professional based on three key factors:',
          '',
          '**Distance:** See how close they are to your clinic (e.g., "0.1 km away"). Applicants are sorted by distance (closest first).',
          '',
          '**Requested Pay:** Review their specific hourly rate for that shift (e.g., "£10.00/hour" or "£100/hour").',
          '',
          '**Specialties & Experience:** View their years of experience in clinical areas such as General Dentist, Implant, or Orthodontics.',
          '',
          'Each applicant card displays:',
          '  • Name and Role',
          '  • Address',
          '  • Email and Phone Number',
          '  • Application Timestamp',
          '  • Hourly Pay Rate',
          '  • Distance from your clinic',
          '  • Specialties with years of experience',
        ],
        images: ["/images/practice/applicants-list.png"]
      },
      {
        title: 'Selecting an Applicant',
        paragraphs: [
          'Once you have decided on a professional from the list:',
          '',
          '**Select:** Click the green **Select** button next to their profile.',
          '',
          '**Confirm Pop-up:** A confirmation window will ask: "Are you sure you want to select [Name] for this appointment?"',
          '',
          '**Final Action:** Click the green **"Yes, Select"** button to proceed, or **"Cancel"** to go back.',
        ],
        images: ["/images/practice/select-applicant.png", "/images/practice/confirm-selection.png"]
      },
      {
        title: 'Appointment Status Progression',
        paragraphs: [
          'After selecting an applicant, your appointment goes through three status stages:',
          '',
          '**Practice Confirmed:**',
          '  • The status badge turns light brown and displays **PRACTICE CONFIRMED**.',
          '  • This indicates you have selected a locum professional for the shift.',
          '  • The selected applicant\'s name appears in the table.',
          '',
          '**Awaiting Response:**',
          '  • This status indicates you have done your part; the shift is now waiting for the locum professional to provide their final acceptance from their mobile app.',
          '  • The selected professional will receive a notification and must confirm from their end.',
          '',
          '**Confirmed:**',
          '  • Once the locum professional provides their final acceptance, the status badge turns green and displays **CONFIRMED**.',
          '  • The badge shows **LOCUM CONFIRMED** and a "Booking Created" indicator appears.',
          '  • The shift is now fully confirmed and ready to proceed.',
        ],
        images: ["/images/practice/status-progression.png"]
      }
    ],
    importantNotes: [
      'Appointments must be at least 30 minutes long',
      'Location is automatically set to your practice address for Private practices',
      'All new requests start with a PENDING status until applicants apply',
      'The Applicants column updates in real-time as locum staff apply',
      'Auto-selection is only available when there is exactly one applicant',
      'You can always choose to manually select even with one applicant for more control',
      'Once a shift is CONFIRMED, both parties are committed to the appointment',
      'Always review applicant details (distance, pay rate, experience) before selecting'
    ]
  },

  'my-bookings': {
    title: 'My Bookings',
    steps: [],
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'The **My Bookings** tab serves as your practice\'s official confirmed work schedule, holding all appointments that have completed the full selection and acceptance process.',
          '',
          'Once a shift is confirmed by both you and the locum, it moves from the general **Appointments** list into this dedicated space.',
          '',
          '**Centralized Schedule:** You can view all confirmed shifts in one place to manage your daily or weekly clinical staffing.',
          '',
          '**Shift Overview:** The table displays essential data including the **Date**, **Start/End Times**, **Locum Name**, **Mobile Number** and **Email Address**, which is essential for coordination on the day of the shift.',
        ],
        images: ["/images/practice/my-bookings-overview.png"]
      },
      {
        title: 'Viewing Your Bookings',
        paragraphs: [
          'The **Practice Bookings** table shows all your confirmed bookings with the following information:',
          '',
          '**DATE & TIME:** Shows the scheduled date and time window for the shift',
          '',
          '**LOCATION:** Displays the clinic address where the shift will take place',
          '',
          '**LOCUM:** Shows the name of the selected locum professional',
          '',
          '**CONTACT:** Displays the locum\'s mobile number and email address for direct communication',
          '',
          '**STATUS:** Shows the current status badge (CONFIRMED, COMPLETED, etc.)',
          '',
          '**DATE:** Shows how long ago the booking was made (e.g., "4 months")',
          '',
          '**ACTIONS:** Contains action buttons like "Cancel" for managing the booking',
        ],
        images: ["/images/practice/bookings-table.png"]
      },
      {
        title: 'Show Filters',
        paragraphs: [
          'To efficiently manage a busy schedule, you can use the **Show Filters** button to customize your view. These filters allow you to organize your bookings based on their current status:',
          '',
          '**Search:** Find specific shifts by searching for a locum name or location.',
          '',
          '**Status:** Filter for shifts that are **Completed**, **Pending**, or **Cancelled**.',
          '',
          '**Date Range:** Use the **Start Date** and **End Date** fields to view shifts from a specific week or month.',
          '',
          '**Toggle Visibility:**',
          'Click **Hide Filters** at any time to collapse the menu and return to your full booking list.',
        ],
        images: ["/images/practice/show-filters.png"]
      },
      {
        title: 'The Cancellation Policy',
        paragraphs: [
          'Laks Dent has specific rules regarding cancellations to ensure practices aren\'t left without staff. According to your "Booking Information" panel:',
          '',
          '| Cancellation Timing | Penalty / Rule |',
          '|---------------------|----------------|',
          '| Over 48 hours notice | No penalty. |',
          '| Within 48 hours | Penalty equal to **3 hours pay.** |',
          '| Within 24 hours | Penalty equal to **6 hours pay.** |',
          '| Once job has started | Cannot be cancelled. |',
          '',
          '**How to Cancel:** If you must cancel, click the red **Cancel** button on the booking.',
        ],
        images: ["/images/practice/cancellation-policy.png"]
      },
      {
        title: 'How to Cancel a Booking',
        paragraphs: [
          'If you must cancel a booking, click the red **Cancel** button on the booking.',
          '',
          'When you click the red Cancel button, a "Cancel Booking" window appears.',
          '',
          '**Step 1: Provide a Reason**',
          '1. Look for the text box labeled "Please provide a reason for cancellation (required)".',
          '2. Type your reason (e.g., "Illness," "Emergency," or "Transport Issues").',
          '3. Only after entering text will the Yes, Cancel Booking button become active to complete the process.',
          '',
          '**Step 2: Confirm Cancellation**',
          'The modal will display the booking details and any applicable cancellation penalty. Click **"Yes, Cancel Booking"** to proceed or **"No, Keep Booking"** to cancel the action.',
          '',
          'You will see a green "Booking Cancelled" success message.',
        ],
        images: ["/images/practice/cancel-booking-modal.png"]
      },
      {
        title: 'Viewing Cancellation Details',
        paragraphs: [
          'Once a booking is cancelled, you can view the specific financial breakdown:',
          '',
          '**View/Hide Details:** Click the **View Penalty** button on the cancelled shift to expand the details, or **Hide Penalty** to collapse them.',
          '',
          '**Detailed Breakdown:** The system displays the **Hourly Rate** (e.g., £1.00/hr), the **Penalty Hours** (e.g., 6 hours), and the total **Penalty Amount** (e.g., £6.00).',
          '',
          '**Audit Trail:** The details include exactly who cancelled the shift, the precise time of cancellation, and the reason you provided.',
          '',
          '**Pending Status:** All penalties initially show a "**PENDING**" status until they are reviewed by an administrator.',
          '',
          '**Success Message:** After cancellation, you will see a green "Booking Cancelled" success message indicating: "Booking cancelled successfully. A penalty of £[amount] has been recorded and is pending admin review."',
        ],
        images: ["/images/practice/cancellation-details.png"]
      },
      {
        title: 'Completing a Booking: Sign-Off & Feedback',
        paragraphs: [
          'The final stage of a shift involves a formal verification process to ensure the hours worked are accurate and to provide feedback on the locum\'s performance.',
          '',
          'Once the locum professional has completed their shift and provided their signature on their mobile app, the practice must verify the work:',
          '',
          '**Verification Request:**',
          'The timesheet will be handed over to you for your final approval.',
          '',
          '**Manager Signature:**',
          'You must provide your own digital signature and enter your unique Manager ID to authenticate the timesheet.',
          '',
          '**Confirmation:**',
          'This digital sign-off is a critical step that triggers the finalization of the booking and initiates any automated invoicing processes.',
          '',
          '**Star Rating:**',
          'You can award the staff member a rating from 1 to 5 stars based on the quality of their work.',
          '',
          '**Performance Remarks:**',
          'You have the option to leave a written remark or feedback detailing your experience with the locum.',
          '',
          '**Continuous Improvement:**',
          'This feedback is shared with the agency and is visible on the locum\'s profile to help maintain high standards across the platform.',
        ],
        images: ["/images/practice/timesheet-signoff.png"]
      },
      {
        title: 'Final Status: COMPLETED',
        paragraphs: [
          'Immediately after you submit the signed timesheet with your feedback, the status of the shift will update in your dashboard:',
          '',
          '**Badge Update:**',
          'In the My Bookings tab, the status badge will change from green "CONFIRMED" to a light grey **COMPLETED** badge.',
          '',
          '**Time Until Column:**',
          'The "Time Until" field will now display "Started/Past", indicating the shift is officially over and verified.',
          '',
          '**Completed Bookings Tracking:**',
          'You can always track the total number of finished shifts by checking the "Past" count in your Booking Overview on the main dashboard.',
        ],
        images: ["/images/practice/completed-status.png"]
      }
    ],
    importantNotes: [
      'My Bookings is your official work diary for all confirmed shifts',
      'Always check locum contact details before your shift',
      'Cancellation penalties apply based on timing - cancel as early as possible to avoid fees',
      'You cannot cancel a booking once the job has started',
      'All cancellation penalties are reviewed by an administrator before being finalized',
      'Use filters to efficiently manage and find specific bookings in your schedule',
      'Manager signature and ID are required for timesheet approval',
      'Feedback and ratings help maintain quality standards across the platform'
    ]
  },

  'staff-management': {
    title: 'Staff Management',
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
  { id: 'forgot-password', title: 'Forgot Password' },
  { id: 'home-overview', title: 'Home Overview' },
  { id: 'booking-overview', title: 'Booking Overview' },
  { id: 'footer-section', title: 'Footer Section' },
  { id: 'essential-payment-setup', title: 'Essential Payment Setup' },
  { id: 'appointments', title: 'Managing Appointments' },
  { id: 'my-bookings', title: 'My Bookings' },
  { id: 'staff-management', title: 'Staff Management' },
  { id: 'settings', title: 'Settings and Preferences' },
  { id: 'enabling-push-notifications', title: 'Enabling Push Notifications' },
];

