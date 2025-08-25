export interface Student {
  _id?: string;
  name: string;
  registrationNumber: string;
  course: string;
  batchStartYear: number;
  batchEndYear: number;
  isPlaced: boolean;
  company?: string;
  package?: number;
  studentFeedback?: string;
  recruiterFeedback?: string;
  recruiterRating?: number;
  employmentStatus?: 'joined' | 'not_joined' | 'left_company' | 'still_working';
  isVerified: boolean;
  verifiedAt?: Date;
  submittedAt: Date;
  updatedAt: Date;
  recruiterName?: string;
  recruiterPosition?: string;
  recruiterEmail?: string;

}

export interface Company {
  _id?: string;
  name: string;
  totalStudents: number;
  verifiedStudents: number;
  avgPackage: number;
  avgRating: number;
  stillWorking: number;
  leftCompany: number;
  notJoined: number;
}

export interface CompanyStats {
  company: string;
  totalStudents: number;
  verifiedStudents: number;
  avgPackage: number;
  avgRating: number;
  stillWorking: number;
  leftCompany: number;
  notJoined: number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface StudentFormData {
  name: string;
  registrationNumber: string;
  course: string;
  batchStartYear: number;
  batchEndYear: number;
  isPlaced: boolean;
  company?: string;
  package?: number;
  studentFeedback?: string;
}

export interface RecruiterFormData {
  studentId: string;
  recruiterFeedback: string;
  recruiterRating: number;
  employmentStatus: 'joined' | 'not_joined' | 'left_company' | 'still_working';
}
