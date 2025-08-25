import axios from "axios";
import type {
  Student,
  Company,
  CompanyStats,
  StudentFormData,
  RecruiterFormData,
  ApiResponse,
} from "./types";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;


// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API functions for Students
export const submitStudent = async (
  data: StudentFormData
): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.post("/students", data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to submit student data",
    };
  }
};

export const getStudents = async (): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get("/students");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch students",
    };
  }
};

export const getStudentsByCompany = async (
  companyName: string
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await api.get(
      `/students/company/${encodeURIComponent(companyName)}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch students by company",
    };
  }
};

export const updateStudent = async (
  id: string,
  data: Partial<Student>
): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update student",
    };
  }
};

// API functions for Companies
export const getCompanies = async (): Promise<ApiResponse<Company[]>> => {
  try {
    const response = await api.get("/companies");
    // Transform the string array into Company objects
    if (Array.isArray(response.data)) {
      const companyObjects = response.data.map((companyName: string) => ({
        name: companyName,
        totalStudents: 0,
        verifiedStudents: 0,
        avgPackage: 0,
        avgRating: 0,
        stillWorking: 0,
        leftCompany: 0,
        notJoined: 0,
      }));

      return {
        success: true,
        data: companyObjects,
      };
    }
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch companies",
    };
  }
};

export const getCompanyStats = async (): Promise<
  ApiResponse<CompanyStats[]>
> => {
  try {
    const response = await api.get("/companies/stats");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch company stats",
    };
  }
};

export const getCompanyDetails = async (
  companyName: string
): Promise<ApiResponse<Company>> => {
  try {
    const response = await api.get(
      `/companies/${encodeURIComponent(companyName)}`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch company details",
    };
  }
};

// Update only employment status of a student
// Update student info (status + optional recruiter data)
export const updateStudentStatus = async (
  studentId: string,
  data: {
    recruiterFeedback?: string;
    recruiterRating?: number;
    employmentStatus?: string;
    isVerified?: boolean;
    recruiterName?: string;
    recruiterEmail?: string;
    recruiterPosition?: string;
  }
): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.put(`/students/${studentId}`, data);
    console.log("Response:", response.data);

    return {
      success: true,
      data: response.data.student, // backend sends { message, student }
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update student",
    };
  }
};

// API functions for Recruiter verification
export const verifyStudent = async (
  data: RecruiterFormData
): Promise<ApiResponse<Student>> => {
  try {
    const response = await api.post(`/students/${data.studentId}/verify`, data);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to verify student",
    };
  }
};

// Health check
export const healthCheck = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: "Server is not responding",
    };
  }
};

export default api;
