export enum NotificationType {
    APPOINTMENT_POSTED = 'appointment_posted',
    APPLICATION_RECEIVED = 'application_received',
    APPLICANT_SELECTED = 'applicant_selected',
    APPOINTMENT_CONFIRMED = 'appointment_confirmed',
    APPOINTMENT_REJECTED = 'appointment_rejected',
    BOOKING_CANCELLED = 'booking_cancelled',
    TIMESHEET_SUBMITTED = 'timesheet_submitted',
    TIMESHEET_APPROVED = 'timesheet_approved',
    PAYMENT_SUCCESS = 'payment_success',
    PAYMENT_FAILED = 'payment_failed',
  }
  
  export type UserType = 'locum' | 'practice' | 'branch';
  
  export interface NotificationData {
    type: NotificationType;
    userType: UserType;
    url?: string;
    [key: string]: any;
  }
  
  export interface NotificationPayload {
    title: string;
    body: string;
    data: NotificationData;
  }