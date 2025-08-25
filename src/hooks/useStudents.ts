import { useState, useCallback } from "react";
import type {
  Student,
  StudentFormData,
  RecruiterFormData,
  ApiResponse,
} from "../lib/types";
import {
  submitStudent,
  getStudents,
  getStudentsByCompany,
  updateStudent,
  verifyStudent,
} from "../lib/api";

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudents();
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        setError(response.error || "Failed to fetch students");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // In the useStudents.ts file
  const fetchStudentsByCompany = useCallback(
    async (companyName: string): Promise<ApiResponse<Student[]>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStudentsByCompany(companyName);
        console.log("API Response:", response); // Add this log
        if (response.success && response.data) {
          setStudents(response.data);
        } else {
          setError(response.error || "Failed to fetch students by company");
        }
        return response; // Return the response
      } catch (err) {
        console.error("Error in fetchStudentsByCompany:", err); // Add this log
        setError("An unexpected error occurred");
        return {
          success: false,
          error: "An unexpected error occurred",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createStudent = useCallback(
    async (data: StudentFormData): Promise<ApiResponse<Student>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await submitStudent(data);
        console.log("API Response:", response); // Add this log
        if (response.success && response.data) {
          setStudents((prev) => [...prev, response.data!]);
        } else {
          setError(response.error || "Failed to create student");
        }
        return response;
      } catch (err) {
        console.error("Error in createStudent:", err); // Add this log

        const errorResponse: ApiResponse<Student> = {
          success: false,
          error: "An unexpected error occurred",
        };
        console.error("Error in createStudent:", err); // Add this log
        setError(errorResponse.error || "An unexpected error occurred");
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateStudentData = useCallback(
    async (
      id: string,
      data: Partial<Student>
    ): Promise<ApiResponse<Student>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await updateStudent(id, data);
        if (response.success && response.data) {
          setStudents((prev) =>
            prev.map((student) =>
              student._id === id ? response.data! : student
            )
          );
        } else {
          setError(response.error || "Failed to update student");
        }
        return response;
      } catch (err) {
        const errorResponse: ApiResponse<Student> = {
          success: false,
          error: "An unexpected error occurred",
        };
        setError(errorResponse.error || "An unexpected error occurred");
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyStudentData = useCallback(
    async (data: RecruiterFormData): Promise<ApiResponse<Student>> => {
      setLoading(true);
      setError(null);
      try {
        const response = await verifyStudent(data);
        if (response.success && response.data) {
          setStudents((prev) =>
            prev.map((student) =>
              student._id === data.studentId ? response.data! : student
            )
          );
        } else {
          setError(response.error || "Failed to verify student");
        }
        return response;
      } catch (err) {
        const errorResponse: ApiResponse<Student> = {
          success: false,
          error: "An unexpected error occurred",
        };
        setError(errorResponse.error || "An unexpected error occurred");
        return errorResponse;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    students,
    loading,
    error,
    fetchStudents,
    fetchStudentsByCompany,
    createStudent,
    updateStudentData,
    verifyStudentData,
    clearError,
  };
};
