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
        images: ["/images/1.jpeg", "/images/2.jpeg"]
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
        images: ["/images/3.jpeg", "/images/4.png"]
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
        description: "Verify your email address to complete registration",
        instructions: [
          "1. Check your email inbox for a message from 'Laks Dent Agency' with the subject 'Confirm Your Signup'",
          "2. Click the 'Confirm your mail' button inside the email",
          "   Note: If the confirmation button does not work, you may use the alternative confirmation link provided in the email",
          "3. You will be redirected to the Home page",
          "4. Tap the hamburger menu icon (three horizontal lines) in the top right corner of the screen, click Login",
          "5. Select 'Locum Staff' when prompted with 'Do you want to login as a...'",
          "6. You will then be redirected to the Login page, where you must enter your email address and password",
          "   Before signing in, make sure to tick the 'I'm not a robot' checkbox to verify you are human",
          "   Once completed, click Sign In to access your account"
        ],
        images: ["/images/16.jpeg"]
      },
      {
        number: 10,
        title: "Admin Approval",
        description: "Wait for admin approval to access your account",
        instructions: [
          "Important:",
          "Once your account is created successfully and you have confirmed your email, your account will still need to be approved by the admin before you can log in",
          "Your account is awaiting approval from the administrator",
          "You will see a 'Pending Approval' message after attempting to sign in",
          "Once approved, you will be able to log in and start browsing and applying for appointments"
        ],
        images: ["/images/21.png"]
      }
    ],
    importantNotes: [
      "All fields marked with * are required and must be filled before submission",
      "Make sure your email address is correct as you will need it for verification",
      "Your password must meet all security requirements for account protection",
      "After registration, check your email and verify your account before logging in",
      "Once your account is created successfully and you have confirmed your email, your account will still need to be approved by the admin before you can log in",
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
        images: ['/images/39.jpeg',]
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
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'The **Appointment Requests** tab is your central hub for finding and securing new shifts. It is divided into three primary sub-sections:',
          '1. Request Appointment (Finding Jobs)',
          '  • **Available Requests:** Under this sub-tab, you will see a list of jobs available for your role'
        ],
        images: ['/images/46.jpeg']
      },
      {
        title: '1. Request Appointment (Finding Jobs)',
        paragraphs: [
          'Browse and apply for available appointment requests that match your role and preferences.'
        ]
      },
      {
        title: 'Filtering',
        paragraphs: [
          'Use the Distance dropdown to filter jobs (e.g., "Within 80 km") and click Refresh.'
        ],
        images: ['/images/47.jpeg']
      },
      {
        title: 'Applying',
        paragraphs: [
          '1. View the Practice, Start/End Times, and Location.',
          '2. Click the green **Apply** button. (Appointments whose start time is near are marked as Urgent in red)',
          '3. A "Confirm Application" pop-up will appear. Click **Yes, Apply**.'
        ],
        images: ['/images/confirm-application-popup.png']
      },
      {
        title: 'Successful Application',
        paragraphs: [
          'After receiving the successful application message, your request is sent to the dental practice for review.'
        ],
        images: ['/images/successful-application-message.png']
      },
      {
        title: 'Ignoring',
        paragraphs: [
          '1. Find the eye icon with a diagonal line (the "dash") next to the "Apply" button on an available shift.',
          '2. A pop-up window titled "Ignore Appointment" will appear, asking: "Are you sure you want to ignore this appointment?"',
          '3. Tap the red **Yes, Ignore** button.',
          '',
          '**Important:** Once ignored, you won\'t see that specific shift in your available requests anymore.'
        ],
        images: ['/images/48.jpeg']
      },
      {
        title: '2. My Applications (Tracking Your Applications)',
        paragraphs: [
          'Once you apply, the job moves here while you wait for the practice to review your profile.',
          '',
          '**Status Alert:** You will see a banner indicating how many applications are currently pending.',
          '',
          '**Applied Status:** The job will show a status of **Applied** in green. At this stage, you are waiting for the dental practice to "Confirm" you for the shift.'
        ],
        images: ['/images/49.jpeg']
      },
      {
        title: '3. Confirmations (Finalizing Your Shift)',
        paragraphs: [
          'If the practice accepts your application, the job moves to this final step. You are not fully booked until you confirm here.',
          '',
          '**Final Acceptance:**',
          '1. Click the green **Accept** button next to the appointment.',
          '2. A "**Confirm Appointment**" pop-up will ask: "Are you sure you want to accept this appointment?"',
          '3. Click **Yes, Accept**.',
          '',
          '**Confirmation:**',
          'A **Success!** pop-up will appear once the booking is finalized.'
        ],
        images: ['/images/50.jpeg','/images/56.jpeg']
      },
      {
        title: 'Declining a Selected Appointment',
        paragraphs: [
          'If you are no longer able to work a shift that a practice has offered you, you must decline it so they can find another professional.',
          '',
          '1. Click the **Decline** button on the appointment card.',
          '2. A "Reject Appointment" pop-up will appear. You must enter a rejection reason in the provided text box (e.g., "Schedule conflict").',
          '3. Tap the red **Reject** button to finalize your decision.',
          '4. A "Success!" message will confirm: "Selection rejected, Practice can select another user".'
        ],
        images: ['/images/51.jpeg', '/images/54.jpeg','/images/53.jpeg']
      }
    ],
    importantNotes: [
      'You must have a payment card added before you can apply for appointments',
      'Use the Distance filter to find jobs within your preferred travel distance',
      'Always review practice details, location, and time before accepting',
      'Once you apply, you cannot cancel until the practice responds',
      'You must confirm in "Confirmations" to finalize your booking',
      'If you ignore an appointment, you won\'t see it in your available requests anymore',
      'Check back regularly for new available requests'
    ]
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

  'my-bookings': {
    title: 'My Bookings',
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'Once a booking is finalized, it moves to the **My Bookings** tab. This is your official work diary.'
        ]
      },
      {
        title: '1. Viewing Your Shifts',
        paragraphs: [
          'In this section, you can see a high-level overview of your confirmed jobs:',
          '',
          '**Status:** Confirmed shifts are marked with a green "CONFIRMED" badge.',
          '',
          '**Time Until:** This column shows how long you have until the shift starts (e.g., "Started/Past").',
          '',
          '**Practice Details:** You can now see the practice name and their direct Contact Number (e.g., 0711388446) in case you need to call them regarding your arrival.'
        ],
        images: ['/images/49.jpeg']
      },
      {
        title: 'Filters',
        paragraphs: [
          'To efficiently manage a busy schedule, you can use the **Show Filters** button to customize your view. These filters allow you to organize your bookings based on their current status:',
          '',
          '**Search:** Find specific shifts by searching for a practice name or location.',
          '',
          '**Status:** Filter for shifts that are **Completed**, **Pending**, or **Cancelled**.',
          '',
          '**Date Range:** Use the **Start Date** and **End Date** fields to view shifts from a specific week or month.',
          '',
          '**Toggle Visibility:**',
          'Click **Hide Filters** at any time to collapse the menu and return to your full booking list.'
        ],
      },
      {
        title: '2. The Cancellation Policy',
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
          '**How to Cancel:** If you must cancel, click the red **Cancel** button.'
        ]
      },
      {
        title: 'How to Cancel',
        paragraphs: [
          'If you must cancel, click the red Cancel button.',
          '',
          'When you click the red Cancel button, a "Cancel Booking" window appears.',
          '',
          '1. Look for the text box labeled "Please provide a reason for cancellation (required)".',
          '2. Type your reason (e.g., "Illness," "Emergency," or "Transport Issues").',
          '3. Only after entering text will the Yes, Cancel Booking button become active to complete the process.',
          '',
          'You will see a green "Booking Cancelled" success message.'
        ],
        images: ['/images/55.jpeg',]
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
          '**Pending Status:** All penalties initially show a "**PENDING**" status until they are reviewed by an administrator.'
        ],
      }
    ],
    importantNotes: [
      'My Bookings is your official work diary for all confirmed shifts',
      'Always check practice contact details before your shift',
      'Cancellation penalties apply based on timing - cancel as early as possible to avoid fees',
      'You cannot cancel a booking once the job has started',
      'All cancellation penalties are reviewed by an administrator before being finalized',
      'Use filters to efficiently manage and find specific bookings in your schedule'
    ]
  },

  'timesheet-submission': {
    title: 'Timesheet Submission',
    content: [
      {
        title: 'Overview',
        paragraphs: [
          'The **Timesheet** tab is where you record your actual worked hours to ensure correct payment. It provides a weekly overview of your dental appointments, allowing you to access specific days and mark your attendance.'
        ],
        images: ['/images/57.jpeg']
      },
      {
        title: '1. Recording Your Shift Times',
        paragraphs: [
          'In the **Weekly Calendar**, each day in the calendar lists the number of bookings associated with that specific date. Click on a specific day in the calendar to view the detailed appointment list for that date.',
          '',
          'Each shift in the list shows its status, such as **CONFIRMED** or **Completed**.',
          '',
          '**Important:**',
          'Bookings remain locked until 30 minutes before their scheduled start time. Once you are within this window you can select the booking and fill in your timesheet with your actual work hours.',
          '',
          'Click on any unlocked booking to begin time tracking.'
        ],
        images: ['/images/58.jpeg']
      },
      {
        title: 'Time Tracking Interface',
        paragraphs: [
          'Use the **"Time Tracking"** interface to set your **Start Time** and **End Time**. You can click the **"Now"** button to use the current time or manually adjust and click **"Set"**.',
          '',
          '**Hours Calculation:**',
          'Total hours = End time - Start time. If both lunch break times are entered, the lunch duration will be deducted. If only one lunch time is entered, it will be ignored.',
          '',
          '**Button Functionality:**',
          '• Once a time has been entered and "Set," the button\'s function automatically changes to **Reset**.',
          '• Clicking **Reset** clears the previously entered time, allowing you to enter a new one if a mistake was made.',
          '• This applies to all tracking fields: Start Time, End Time, Break Start, and Break End.'
        ],
        images: ['/images/59.jpeg']
      },
      {
        title: '2. Hours Calculations',
        paragraphs: [
          'The platform automatically calculates your total hours based on your entries:',
          '',
          '**Deduction Rule:** The total hours worked is calculated as (End Time - Start Time).',
          '',
          '**Lunch Breaks:** If you enter both a **Break Start** and **Break End** time, the duration of that lunch break is automatically deducted from your total hours.',
          '',
          '**Single Entries:** If you only enter one lunch break time (either start or end), it will be ignored in the final calculation.',
          '',
          'You can preview your **Estimated Total Hours** and **Estimated Pay** before submitting.'
        ],
        images: ['/images/60.jpeg']
      },
      {
        title: '3. Collecting Signatures and Submitting',
        paragraphs: [
          'Once times are recorded, you must finalize the times through the **"Submit"** button.',
          '',
          '**Signatures Required:** You must provide your own **Staff Signature** by drawing in the designated box.',
          '',
          'The timesheet summary will display:',
          '• **Date** of the shift',
          '• **Start Time** and **End Time** you recorded',
          '',
          'After drawing your signature, click **"Submit Timesheet"** to proceed.'
        ],
        images: ['/images/62.jpeg','/images/61.jpeg']
      },
      {
        title: 'Manager Verification',
        paragraphs: [
          'The practice manager must also provide their **Manager Signature**, enter their **Manager ID**, and give you a **Rating (1-5)** and optional **Remark**.',
          '',
          '**Important Information:**',
          '• Each job has its own separate timesheet',
          '• By signing, you confirm that the time entries for this job are accurate',
          '• If both manager signature and ID are provided, the timesheet will be automatically approved and locked',
          '• Signatures will be saved as images'
        ],
        images: ['/images/63.jpeg']
      },
      {
        title: 'Final Submission',
        paragraphs: [
          'Click **"Submit Timesheet"**. A success message will appear once the files are uploaded and the timesheet is submitted successfully.',
          '',
          '**Status Updates:**',
          'After submission, your booking will show a **"COMPLETED"** status with a checkmark in My Bookings.'
        ],
        images: ['/images/64.jpeg']
      }
    ],
    importantNotes: [
      'Timesheet tab is where you record actual worked hours for correct payment',
      'Bookings remain locked until 30 minutes before their scheduled start time',
      'You must provide both Start Time and End Time to calculate total hours',
      'Lunch breaks are only deducted if both Break Start and Break End times are entered',
      'Staff signature is required before submission',
      'Manager signature and ID are required for automatic approval',
      'Each job has its own separate timesheet',
      'Once submitted and approved, the booking status changes to COMPLETED'
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


};

export const sections = [
  { id: 'login-registration', title: 'Login and Registration' },
  { id: 'forgot-password', title: 'Forgot Password' },
  { id: 'home-dashboard', title: 'Home (Dashboard Overview)' },
  { id: 'document-upload', title: 'Document Upload' },
  { id: 'appointment-requests', title: 'Appointment Requests' },
  { id: 'essential-payment-setup', title: 'Essential Payment Setup' },
  { id: 'my-bookings', title: 'My Bookings' },
  { id: 'timesheet-submission', title: 'Timesheet Submission' },
  { id: 'enabling-push-notifications', title: 'Enabling Push Notifications' },
  { id: 'troubleshooting', title: 'Troubleshooting' },
];

