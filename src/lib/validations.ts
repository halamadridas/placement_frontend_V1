import { z } from 'zod';

// Student form validation schema
export const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  registrationNumber: z.string().min(5, 'Registration number must be at least 5 characters').max(20, 'Registration number must be less than 20 characters'),
  course: z.string().min(2, 'Course must be at least 2 characters').max(100, 'Course must be less than 100 characters'),
  batchStartYear: z.number().min(2010, 'Batch start year must be 2010 or later').max(new Date().getFullYear() + 5, 'Batch start year cannot be more than 5 years in the future'),
  batchEndYear: z.number().min(2010, 'Batch end year must be 2010 or later').max(new Date().getFullYear() + 5, 'Batch end year cannot be more than 5 years in the future'),
  isPlaced: z.boolean(),
  company: z.string().optional(),
  package: z.number().min(0, 'Package must be non-negative').optional(),
  studentFeedback: z.string().max(1000, 'Feedback must be less than 1000 characters').optional(),
}).refine((data) => {
  if (data.isPlaced && (!data.company || !data.package)) {
    return false;
  }
  return true;
}, {
  message: "Company and package are required when student is placed",
  path: ["company"]
}).refine((data) => {
  if (data.batchEndYear <= data.batchStartYear) {
    return false;
  }
  return true;
}, {
  message: "Batch end year must be after batch start year",
  path: ["batchEndYear"]
});

// Recruiter verification form validation schema
export const recruiterFormSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  recruiterFeedback: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback must be less than 1000 characters'),
  recruiterRating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  employmentStatus: z.enum(['joined', 'not_joined', 'left_company', 'still_working', ], {
    error: 'Employment status is required',
  }),
});

// Company search validation schema
export const companySearchSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
});

export type StudentFormData = z.infer<typeof studentFormSchema>;
export type RecruiterFormData = z.infer<typeof recruiterFormSchema>;
export type CompanySearchData = z.infer<typeof companySearchSchema>;
