export type PaymentStatus = "Pending" | "Approved" | "Rejected";
export type RegistrationStatus = "Registered" | "Cancelled";
export type SessionStatus = "open" | "closed";

export interface Registration {
  id: string;
  uid: string;
  name: string; // UPPERCASE
  email: string; // @klu.ac.in
  registerNumber: string;
  phone: string;
  department: string;
  year: string;
  transactionId: string; // UPI / UTR Transaction Reference Number
  paymentScreenshot: string;
  cloudinaryPublicId: string;
  paymentStatus: PaymentStatus;
  registrationStatus: RegistrationStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  regId: string;
  registerNumber: string;
  name: string;
  scannedAt: string;
}

export interface AttendanceSession {
  id: string;
  sessionName: string;
  createdAt: string;
  status: SessionStatus; // "open" or "closed"
  records: AttendanceRecord[];
}

export interface EventSettings {
  eventName: string;
  organizedBy: string;
  group: string;
  tagline: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  fee: number;
  maxSpots: number;
  deadline: string;
  registrationEnabled: boolean;
  qrCodeUrl: string;
  posterUrl?: string;
}

export interface AdminUser {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
}

export type DepartmentOption =
  | "CSE"
  | "ECE"
  | "EEE"
  | "MECH"
  | "CIVIL"
  | "BIO";

export type YearOption = "II Year" | "III Year" | "IV Year";
