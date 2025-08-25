import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recruiterFormSchema,
  type RecruiterFormData,
} from "../../lib/validations";
import { useStudents } from "../../hooks/useStudents";
import { useCompanies } from "../../hooks/useCompanies";
import { CompanySearch } from "./CompanySearch";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  Users,
  Star,
  MessageSquare,
  CheckSquare,
  XSquare,
  Clock,
  UserCheck,
  PersonStanding,
  ContactRound,
  Timer,
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  Target,
  X,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import type { Student } from "../../lib/types";
import { Avatar } from "@radix-ui/react-avatar";
import { updateStudentStatus } from "@/lib/api";
import * as XLSX from "xlsx";

type SortField =
  | "name"
  | "package"
  | "submittedAt"
  | "verifiedAt"
  | "course"
  | "registrationNumber";
type SortDirection = "asc" | "desc";

interface VerificationModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (data: {
    feedback: string;
    rating: number;
    employmentStatus: string;
  }) => Promise<void>;
  isLoading: boolean;
  employmentStatus: string;
  recruiterInfo: {
    email: string;
    name: string;
    position: string;
  };
}

// Star Rating Component for the Modal
const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
  showLabel?: boolean;
}> = ({ rating, onRatingChange, disabled = false, showLabel = true }) => {
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return "No Rating";
    if (rating === 1) return "Poor";
    if (rating === 2) return "Fair";
    if (rating === 3) return "Good";
    if (rating === 4) return "Very Good";
    if (rating === 5) return "Excellent";
    return "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !disabled && onRatingChange(star)}
            onMouseEnter={() => !disabled && setHoveredRating(star)}
            onMouseLeave={() => !disabled && setHoveredRating(0)}
            className={`p-1 rounded transition-colors ${
              disabled
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-100 cursor-pointer"
            }`}
            disabled={disabled}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } ${disabled ? "opacity-50" : "hover:text-yellow-200"}`}
            />
          </button>
        ))}
      </div>
      {showLabel && (
        <div className="text-sm font-medium text-gray-600">
          {rating}/5 - {getRatingLabel(rating)}
        </div>
      )}
    </div>
  );
};

const VerificationModal: React.FC<VerificationModalProps> = ({
  student,
  isOpen,
  onClose,
  onVerify,
  isLoading,
  employmentStatus,
  recruiterInfo,
}) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number>(0); // Start with 0 (no rating)

  const handleSubmit = async () => {
    if (feedback.trim().length < 10) {
      toast.error("Feedback must be at least 10 characters long");
      return;
    }

    // If no rating is selected, default to 0
    const finalRating = rating === 0 ? 0 : rating;

    await onVerify({
      feedback: feedback.trim(),
      rating: finalRating,
      employmentStatus,
    });

    // Reset form
    setFeedback("");
    setRating(0);
  };

  const handleClose = () => {
    setFeedback("");
    setRating(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Verify Student Placement
          </DialogTitle>
          <DialogDescription>
            Provide verification details for {student.name}'s placement at your
            company.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Student:</span>
                  <p className="font-semibold">{student.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Course:</span>
                  <p>{student.course}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Package:</span>
                  <p className="font-semibold text-green-600">
                    {student.package
                      ? `₹${student.package} LPA`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Employment Status:
                  </span>
                  <Badge variant="outline" className="mt-1">
                    {employmentStatus
                      ? employmentStatus.replace("_", " ").toUpperCase()
                      : "Not Set"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruiter Info Display */}
          <Card className="bg-blue-50">
            <CardContent className="pt-4">
              <h4 className="font-medium text-blue-800 mb-2">
                Verification by:
              </h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {recruiterInfo.name}
                </p>
                <p>
                  <span className="font-medium">Position:</span>{" "}
                  {recruiterInfo.position}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {recruiterInfo.email}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rating Selection - Updated */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Rate the Student <span className="text-gray-400">(Optional)</span>
            </Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              disabled={isLoading}
              showLabel={true}
            />
            <p className="text-xs text-gray-500">
              Click on a star to rate the student's performance. Leave unrated
              if you prefer not to provide a rating.
            </p>
          </div>

          {/* Feedback */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-base font-medium">
              Verification Feedback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="feedback"
              placeholder="Provide detailed feedback about the student's performance, skills, and overall contribution to your organization..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isLoading}
            />
            <div className="text-right text-xs text-gray-500">
              {feedback.length}/500 characters (minimum 10 required)
            </div>
          </div>

          {/* Student's Self-Report (if available) */}
          {student.studentFeedback && (
            <div className="space-y-2">
              <Label className="text-base font-medium text-gray-600">
                Student's Self-Report:
              </Label>
              <div className="p-3 bg-blue-50 rounded-md text-sm border-l-4 border-blue-400">
                {student.studentFeedback}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || feedback.trim().length < 10}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Verify Student
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function RecruiterForm() {
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [verifyingStudent, setVerifyingStudent] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [studentStatuses, setStudentStatuses] = useState<
    Record<string, string>
  >({});
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [verificationModalStudent, setVerificationModalStudent] =
    useState<Student | null>(null);

  // Recruiter form state
  const [recruiterInfo, setRecruiterInfo] = useState({
    email: "",
    name: "",
    position: "",
  });

  const {
    students,
    fetchStudentsByCompany,
    verifyStudentData,
    loading,
    error,
    clearError,
  } = useStudents();
  const { companies, fetchCompanies } = useCompanies();

  const employmentStatusOptions = [
    { value: "joined", label: "Joined", color: "bg-green-100 text-green-800" },
    {
      value: "not_joined",
      label: "Not Joined",
      color: "bg-red-100 text-red-800",
    },
    {
      value: "left_company",
      label: "Left Company",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "still_working",
      label: "Still Working",
      color: "bg-blue-100 text-blue-800",
    },
  ];

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      fetchStudentsByCompany(selectedCompany);
    }
  }, [selectedCompany, fetchStudentsByCompany]);

  useEffect(() => {
    if (students.length > 0) {
      const initialStatuses: Record<string, string> = {};
      students.forEach((student) => {
        if (student._id) {
          initialStatuses[student._id] = student.employmentStatus || "";
        }
      });
      setStudentStatuses(initialStatuses);
    }
  }, [students]);

  // Clear errors when component unmounts or major state changes
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || student.employmentStatus === statusFilter;
      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && student.isVerified) ||
        (verificationFilter === "pending" && !student.isVerified);

      return matchesSearch && matchesStatus && matchesVerification;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "package":
          aValue = a.package || 0;
          bValue = b.package || 0;
          break;
        case "submittedAt":
          aValue = new Date(a.submittedAt || 0);
          bValue = new Date(b.submittedAt || 0);
          break;
        case "verifiedAt":
          aValue = new Date(a.verifiedAt || 0);
          bValue = new Date(b.verifiedAt || 0);
          break;
        case "course":
          aValue = a.course.toLowerCase();
          bValue = b.course.toLowerCase();
          break;
        case "registrationNumber":
          aValue = a.registrationNumber.toLowerCase();
          bValue = b.registrationNumber.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [
    students,
    searchTerm,
    sortField,
    sortDirection,
    statusFilter,
    verificationFilter,
  ]);

  // Statistics calculations
  const statistics = useMemo(() => {
    const packages = students
      .filter((s) => s.package && s.package > 0)
      .map((s) => s.package!);
    const verifiedStudents = students.filter((s) => s.isVerified);

    return {
      totalStudents: students.length,
      verifiedStudents: verifiedStudents.length,
      pendingStudents: students.length - verifiedStudents.length,
      placedStudents: students.filter((s) => s.isPlaced).length,
      highestPackage: packages.length > 0 ? Math.max(...packages) : 0,
      lowestPackage: packages.length > 0 ? Math.min(...packages) : 0,
      averagePackage:
        packages.length > 0
          ? packages.reduce((sum, p) => sum + p, 0) / packages.length
          : 0,
      medianPackage:
        packages.length > 0
          ? packages.sort((a, b) => a - b)[Math.floor(packages.length / 2)]
          : 0,
      joinedCount: students.filter((s) => s.employmentStatus === "joined")
        .length,
      notJoinedCount: students.filter(
        (s) => s.employmentStatus === "not_joined"
      ).length,
      leftCompanyCount: students.filter(
        (s) => s.employmentStatus === "left_company"
      ).length,
      stillWorkingCount: students.filter(
        (s) => s.employmentStatus === "still_working"
      ).length,
    };
  }, [students]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <SortAsc className="h-3 w-3" />
      ) : (
        <SortDesc className="h-3 w-3" />
      );
    }
    return null;
  };

  const handleCompanySelect = (companyName: string) => {
    setSelectedCompany(companyName);
    setStudentStatuses({});
    setSearchTerm("");
    setStatusFilter("all");
    setVerificationFilter("all");
    clearError();
  };

  const handleRecruiterInfoChange = (field: string, value: string) => {
    setRecruiterInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateRecruiterInfo = () => {
    const errors = [];

    if (!recruiterInfo.email.trim()) {
      errors.push("Please enter your email address");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recruiterInfo.email)) {
        errors.push("Please enter a valid email address");
      }
    }

    if (!recruiterInfo.name.trim()) {
      errors.push("Please enter your name");
    }

    if (!recruiterInfo.position.trim()) {
      errors.push("Please enter your position");
    }

    if (errors.length > 0) {
      toast.error(errors.join(". "));
      return false;
    }

    return true;
  };

  const handleStatusChange = async (studentId: string, newStatus: string) => {
    if (updatingStatus) return; // Prevent multiple simultaneous updates

    const previousStatus = studentStatuses[studentId] || "";
    setStudentStatuses((prev) => ({ ...prev, [studentId]: newStatus }));
    setUpdatingStatus(studentId);

    try {
      const response = await updateStudentStatus(studentId, {
        employmentStatus: newStatus,
      });

      if (response.success) {
        toast.success("Employment status updated successfully!");
        if (selectedCompany) {
          await fetchStudentsByCompany(selectedCompany);
        }
      } else {
        // Revert the status on error
        setStudentStatuses((prev) => ({
          ...prev,
          [studentId]: previousStatus,
        }));
        toast.error(response.error || "Failed to update employment status");
      }
    } catch (error) {
      // Revert the status on error
      setStudentStatuses((prev) => ({
        ...prev,
        [studentId]: previousStatus,
      }));
      toast.error("Network error: Failed to connect to server");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleVerifyStudent = async (student: Student) => {
    const studentId = student._id!;
    const selectedStatus = studentStatuses[studentId];

    if (!validateRecruiterInfo()) {
      return;
    }

    if (!selectedStatus) {
      toast.error(
        "Please select an employment status before verifying the student."
      );
      return;
    }

    setVerificationModalStudent(student);
  };

  const handleVerificationSubmit = async (verificationData: {
    feedback: string;
    rating: number;
    employmentStatus: string;
  }) => {
    if (!verificationModalStudent) return;

    const studentId = verificationModalStudent._id!;
    setVerifyingStudent(studentId);

    // Use the rating from the modal (0 if not selected)
    const payload = {
      recruiterFeedback: verificationData.feedback,
      recruiterRating: verificationData.rating, // This can be 0 if no rating selected
      employmentStatus: verificationData.employmentStatus,
      isVerified: true,
      recruiterName: recruiterInfo.name,
      recruiterEmail: recruiterInfo.email,
      recruiterPosition: recruiterInfo.position,
      verifiedAt: new Date().toISOString(),
    };

    try {
      const response = await updateStudentStatus(studentId, payload);
      if (response.success) {
        const ratingMessage =
          verificationData.rating > 0
            ? ` with ${verificationData.rating}/5 rating`
            : " (no rating provided)";
        toast.success(
          `${verificationModalStudent.name} verified successfully${ratingMessage}!`
        );
        if (selectedCompany) {
          await fetchStudentsByCompany(selectedCompany);
        }
        setVerificationModalStudent(null);
      } else {
        toast.error(response.error || "Failed to verify student");
      }
    } catch (error) {
      toast.error("Network error: Failed to connect to server");
    } finally {
      setVerifyingStudent(null);
    }
  };

  const getEmploymentStatusBadge = (status: string) => {
    const statusOption = employmentStatusOptions.find(
      (option) => option.value === status
    );
    if (statusOption) {
      return <Badge className={statusOption.color}>{statusOption.label}</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Verified
      </Badge>
    ) : (
      <Badge
        variant="secondary"
        className="flex items-center gap-1 bg-yellow-100 text-yellow-800"
      >
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const getRatingStars = (rating?: number) => {
    if (rating === undefined || rating === null)
      return <span className="text-gray-400">No rating</span>;
    if (rating === 0) return <span className="text-gray-400">Not rated</span>;

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-xs text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const getCurrentStatus = (student: Student) => {
    const localStatus = studentStatuses[student._id!];
    const dbStatus = student.employmentStatus;
    return localStatus || dbStatus || "";
  };

  const isRecruiterInfoComplete = () => {
    return (
      recruiterInfo.email.trim() &&
      recruiterInfo.name.trim() &&
      recruiterInfo.position.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterInfo.email)
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Excel Export Function
  const exportToExcel = () => {
    if (!selectedCompany || students.length === 0) {
      toast.error("No data available to export");
      return;
    }

    try {
      // Prepare data for Excel export
      const excelData = filteredAndSortedStudents.map((student, index) => {
        const employmentStatusLabel =
          employmentStatusOptions.find(
            (option) => option.value === student.employmentStatus
          )?.label ||
          student.employmentStatus ||
          "Not Set";

        return {
          "S.No": index + 1,
          "Student Name": student.name,
          "Registration Number": student.registrationNumber,
          Course: student.course,
          Batch: `${student.batchStartYear} - ${student.batchEndYear}`,
          "Package (LPA)": student.package
            ? `₹${student.package}`
            : "Not specified",
          "Employment Status": employmentStatusLabel,
          "Is Placed": student.isPlaced ? "Yes" : "No",
          "Is Verified": student.isVerified ? "Yes" : "No",
          "Recruiter Rating": student.recruiterRating || "Not rated",
          "Recruiter Name": student.recruiterName  || "N/A",
          "Recruiter Position": student.recruiterPosition || "N/A",
          "Recruiter Email": student.recruiterEmail || "N/A",
          "Recruiter Feedback": student.recruiterFeedback || "N/A",
          "Student Feedback": student.studentFeedback || "N/A",
          "Submitted Date": formatDate(student.submittedAt?.toString() || ''),
          "Verified Date": student.verifiedAt
            ? formatDate(student.verifiedAt?.toString() || '')
            : "Not verified",
          "Last Updated": formatDate(student.updatedAt?.toString() || ''),
        };
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths for better formatting
      const columnWidths = [
        { wch: 6 }, // S.No
        { wch: 25 }, // Student Name
        { wch: 20 }, // Registration Number
        { wch: 15 }, // Course
        { wch: 15 }, // Batch
        { wch: 15 }, // Package
        { wch: 18 }, // Employment Status
        { wch: 12 }, // Is Placed
        { wch: 12 }, // Is Verified
        { wch: 15 }, // Recruiter Rating
        { wch: 20 }, // Recruiter Name
        { wch: 20 }, // Recruiter Position
        { wch: 25 }, // Recruiter Email
        { wch: 40 }, // Recruiter Feedback
        { wch: 40 }, // Student Feedback
        { wch: 20 }, // Submitted Date
        { wch: 20 }, // Verified Date
        { wch: 20 }, // Last Updated
      ];
      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      const sheetName = `${selectedCompany.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_Students`;
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        sheetName.substring(0, 31)
      );

      // Create summary sheet
      const summaryData = [
        { Metric: "Total Students", Count: statistics.totalStudents },
        { Metric: "Verified Students", Count: statistics.verifiedStudents },
        { Metric: "Pending Verification", Count: statistics.pendingStudents },
        { Metric: "Placed Students", Count: statistics.placedStudents },
        { Metric: "Joined Company", Count: statistics.joinedCount },
        { Metric: "Not Joined", Count: statistics.notJoinedCount },
        { Metric: "Left Company", Count: statistics.leftCompanyCount },
        { Metric: "Still Working", Count: statistics.stillWorkingCount },
        {
          Metric: "Highest Package (LPA)",
          Count:
            statistics.highestPackage > 0
              ? `₹${statistics.highestPackage}`
              : "N/A",
        },
        {
          Metric: "Lowest Package (LPA)",
          Count:
            statistics.lowestPackage > 0
              ? `₹${statistics.lowestPackage}`
              : "N/A",
        },
        {
          Metric: "Average Package (LPA)",
          Count:
            statistics.averagePackage > 0
              ? `₹${statistics.averagePackage.toFixed(1)}`
              : "N/A",
        },
        {
          Metric: "Median Package (LPA)",
          Count:
            statistics.medianPackage > 0
              ? `₹${statistics.medianPackage}`
              : "N/A",
        },
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet["!cols"] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:.]/g, "-");
      const filename = `${selectedCompany}_Students_Report_${timestamp}.xlsx`;

      // Download file
      XLSX.writeFile(workbook, filename);

      toast.success(
        `Excel file downloaded successfully! 
        ${filteredAndSortedStudents.length} students exported to ${filename}`
      );
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export Excel file. Please try again.");
    }
  };

  const StudentDetailsModal = ({
    student,
    onClose,
  }: {
    student: Student;
    onClose: () => void;
  }) => (
    <Dialog open={!!student} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Student Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="font-semibold">{student.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Registration Number
                  </label>
                  <p className="font-mono">{student.registrationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Course
                  </label>
                  <p>{student.course}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Batch
                  </label>
                  <p>
                    {student.batchStartYear} - {student.batchEndYear}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Package
                  </label>
                  <p className="font-semibold text-green-600">
                    {student.package
                      ? `₹${student.package} LPA`
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employment Status
                  </label>
                  <div className="mt-1">
                    {getEmploymentStatusBadge(student.employmentStatus || "")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Feedback */}
          {student.studentFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Student Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                  {student.studentFeedback}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Verification Details */}
          {student.isVerified && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Recruiter Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Recruiter Name
                    </label>
                    <p>{student.recruiterName || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Position
                    </label>
                    <p>{student.recruiterPosition || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="font-mono text-sm">
                      {student.recruiterEmail || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Rating
                    </label>
                    <div className="mt-1">
                      {getRatingStars(student.recruiterRating)}
                    </div>
                  </div>
                </div>

                {student.recruiterFeedback && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Recruiter Feedback
                    </label>
                    <p className="mt-1 p-3 bg-green-50 rounded-md border-l-4 border-green-400">
                      {student.recruiterFeedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Submitted:</span>
                  <span className="text-gray-600">
                    {formatDate(student.submittedAt?.toString() || '')}

                  </span>
                </div>
                {student.isVerified && student.verifiedAt && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Verified:</span>
                    <span className="text-gray-600">
                      {formatDate(student.verifiedAt?.toString() || '')}

                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Last Updated:</span>
                    <span className="text-gray-600">
                    {formatDate(student.updatedAt?.toString() || '')}

                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Recruiter Information Form */}
      <Card
        className={
          !isRecruiterInfoComplete()
            ? "border-orange-200 bg-orange-50"
            : "border-green-200 bg-green-50"
        }
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ContactRound className="h-5 w-5" />
            Recruiter Information
            {isRecruiterInfoComplete() && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </CardTitle>
          <CardDescription>
            {!isRecruiterInfoComplete()
              ? "Please fill in your information to start verifying students."
              : "Your information is complete. You can now verify students."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={recruiterInfo.email}
                onChange={(e) =>
                  handleRecruiterInfoChange("email", e.target.value)
                }
                className={
                  recruiterInfo.email.trim() &&
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recruiterInfo.email)
                    ? "border-green-300"
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={recruiterInfo.name}
                onChange={(e) =>
                  handleRecruiterInfoChange("name", e.target.value)
                }
                className={recruiterInfo.name.trim() ? "border-green-300" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">
                Position <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="Enter your position"
                value={recruiterInfo.position}
                onChange={(e) =>
                  handleRecruiterInfoChange("position", e.target.value)
                }
                className={
                  recruiterInfo.position.trim() ? "border-green-300" : ""
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Selection */}
      {isRecruiterInfoComplete() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Selection
            </CardTitle>
            <CardDescription>
              Select a company to view and verify student placements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <CompanySearch
                  value={selectedCompany}
                  onValueChange={handleCompanySelect}
                  placeholder="Search and select company"
                />
              </div>

              {selectedCompany && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Students from {selectedCompany}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Statistics Cards */}
      {isRecruiterInfoComplete() && selectedCompany && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.totalStudents}
                </p>
                <p className="text-xs text-gray-500">Total Students</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.verifiedStudents}
                </p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics.pendingStudents}
                </p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-xl font-bold text-yellow-600">
                  ₹{statistics.highestPackage}
                </p>
                <p className="text-xs text-gray-500">Highest Package</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xl font-bold text-purple-600">
                  ₹{statistics.lowestPackage}
                </p>
                <p className="text-xs text-gray-500">Lowest Package</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="text-xl font-bold text-indigo-600">
                  ₹{statistics.averagePackage.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">Average Package</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Student List with Enhanced Table */}
      {isRecruiterInfoComplete() && selectedCompany && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students from {selectedCompany}
            </CardTitle>
            <CardDescription>
              Review and verify student placement information with advanced
              filtering and sorting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found for {selectedCompany}</p>
                <p className="text-sm">
                  Students need to submit their placement information first.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Export Button and Search/Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {employmentStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={verificationFilter}
                      onValueChange={setVerificationFilter}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Verification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Export Button */}
                  <div className="flex gap-2">
                    <Button
                      onClick={exportToExcel}
                      variant="outline"
                      className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      disabled={filteredAndSortedStudents.length === 0}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export Excel
                    </Button>
                  </div>
                </div>

                {/* Enhanced Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("name")}
                            className="h-auto p-0 font-semibold flex items-center gap-1"
                          >
                            Student {getSortIcon("name")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("registrationNumber")}
                            className="h-auto p-0 font-semibold flex items-center gap-1"
                          >
                            Reg. No. {getSortIcon("registrationNumber")}
                          </Button>
                        </TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("course")}
                            className="h-auto p-0 font-semibold flex items-center gap-1"
                          >
                            Course {getSortIcon("course")}
                          </Button>
                        </TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("package")}
                            className="h-auto p-0 font-semibold flex items-center gap-1"
                          >
                            Package {getSortIcon("package")}
                          </Button>
                        </TableHead>
                        <TableHead>Employment Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort("submittedAt")}
                            className="h-auto p-0 font-semibold flex items-center gap-1"
                          >
                            Submitted {getSortIcon("submittedAt")}
                          </Button>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedStudents.map((student) => (
                        <TableRow
                          key={student._id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-600">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {student.name}
                                </div>
                                {student.isPlaced && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-1 text-xs"
                                  >
                                    Placed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-sm">
                              {student.registrationNumber}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.course}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {student.batchStartYear} -{" "}
                                {student.batchEndYear}
                              </div>
                              <div className="text-gray-500 text-xs">
                                ({student.batchEndYear - student.batchStartYear}{" "}
                                years)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {student.package ? (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-500" />
                                  <span className="font-semibold text-green-600">
                                    ₹{student.package} LPA
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {student.isVerified ? (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  {getEmploymentStatusBadge(
                                    student.employmentStatus || ""
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={getCurrentStatus(student)}
                                    onValueChange={(value) =>
                                      handleStatusChange(student._id!, value)
                                    }
                                    disabled={updatingStatus === student._id}
                                  >
                                    <SelectTrigger className="w-[140px] h-8">
                                      <SelectValue placeholder="Select status">
                                        {getCurrentStatus(student) ? (
                                          <div className="flex items-center gap-2">
                                            {updatingStatus === student._id && (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            )}
                                            <span className="text-xs">
                                              {employmentStatusOptions.find(
                                                (opt) =>
                                                  opt.value ===
                                                  getCurrentStatus(student)
                                              )?.label ||
                                                getCurrentStatus(student)}
                                            </span>
                                          </div>
                                        ) : (
                                          "Select status"
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {employmentStatusOptions.map((option) => (
                                        <SelectItem
                                          key={option.value}
                                          value={option.value}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                option.color.includes("green")
                                                  ? "bg-green-500"
                                                  : option.color.includes("red")
                                                  ? "bg-red-500"
                                                  : option.color.includes(
                                                      "orange"
                                                    )
                                                  ? "bg-orange-500"
                                                  : "bg-blue-500"
                                              }`}
                                            />
                                            {option.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {getCurrentStatus(student) && (
                                    <div className="ml-1">
                                      {getEmploymentStatusBadge(
                                        getCurrentStatus(student)
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {getRatingStars(student.recruiterRating)}
                              {student.recruiterName && (
                                <div className="text-xs text-gray-500">
                                  by {student.recruiterName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVerificationBadge(student.isVerified)}
                              {student.verifiedAt && (
                                <div className="flex gap-1 items-center justify-center px-2 font-semibold text-neutral-800 bg-neutral-200 rounded-full text-xs py-1">
                                  <Timer className="size-3" />
                                  {formatDate(student.verifiedAt?.toString() || '')}

                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-gray-500">
                              <div>📅 {formatDate(student.submittedAt?.toString() || '')}</div>
                              {student.updatedAt !== student.submittedAt && (
                                <div className="mt-1">
                                  🔄 {formatDate(student.updatedAt?.toString() || '')}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedStudent(student)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              {student.isVerified ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>Verified</span>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerifyStudent(student)}
                                  disabled={
                                    verifyingStudent === student._id ||
                                    !getCurrentStatus(student) ||
                                    updatingStatus === student._id
                                  }
                                  className="flex items-center gap-1"
                                  title={
                                    !getCurrentStatus(student)
                                      ? "Please select employment status first"
                                      : "Verify student"
                                  }
                                >
                                  {verifyingStudent === student._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <UserCheck className="h-3 w-3" />
                                  )}
                                  Verify
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Results Summary with Export Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4">
                  <div className="flex items-center gap-4">
                    <span>
                      Showing {filteredAndSortedStudents.length} of{" "}
                      {students.length} students
                    </span>
                    {filteredAndSortedStudents.length > 0 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Download className="h-3 w-3" />
                        <span className="text-xs">Ready for export</span>
                      </div>
                    )}
                  </div>
                  {(searchTerm ||
                    statusFilter !== "all" ||
                    verificationFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setVerificationFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Detailed Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-lg font-bold text-blue-700">
                          {statistics.totalStudents}
                        </p>
                        <p className="text-xs text-blue-600">Total Students</p>
                        <p className="text-xs text-blue-500">
                          Placed: {statistics.placedStudents} (
                          {statistics.totalStudents > 0
                            ? (
                                (statistics.placedStudents /
                                  statistics.totalStudents) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-lg font-bold text-green-700">
                          {statistics.verifiedStudents}
                        </p>
                        <p className="text-xs text-green-600">
                          Verified Students
                        </p>
                        <p className="text-xs text-green-500">
                          {statistics.totalStudents > 0
                            ? (
                                (statistics.verifiedStudents /
                                  statistics.totalStudents) *
                                100
                              ).toFixed(1)
                            : 0}
                          % completion
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-lg font-bold text-purple-700">
                          ₹{statistics.averagePackage.toFixed(1)}
                        </p>
                        <p className="text-xs text-purple-600">
                          Average Package
                        </p>
                        <p className="text-xs text-purple-500">
                          Median: ₹{statistics.medianPackage} LPA
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-lg font-bold text-orange-700">
                          {statistics.joinedCount}
                        </p>
                        <p className="text-xs text-orange-600">
                          Currently Joined
                        </p>
                        <p className="text-xs text-orange-500">
                          Left: {statistics.leftCompanyCount} | Working:{" "}
                          {statistics.stillWorkingCount}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Package Range Details */}
                {statistics.highestPackage > 0 && (
                  <Card className="p-4 bg-gradient-to-r from-yellow-50 to-green-50">
                    <h4 className="font-semibold mb-3 text-gray-700">
                      Package Distribution
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Highest</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{statistics.highestPackage}
                        </p>
                        <p className="text-xs text-gray-500">LPA</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Average</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{statistics.averagePackage.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">LPA</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingDown className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Lowest</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{statistics.lowestPackage}
                        </p>
                        <p className="text-xs text-gray-500">LPA</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-600">
                      <span className="bg-white px-3 py-1 rounded-full border">
                        Range: ₹{statistics.lowestPackage} - ₹
                        {statistics.highestPackage} LPA
                      </span>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Verification Modal */}
      {verificationModalStudent && (
        <VerificationModal
          student={verificationModalStudent}
          isOpen={!!verificationModalStudent}
          onClose={() => setVerificationModalStudent(null)}
          onVerify={handleVerificationSubmit}
          isLoading={!!verifyingStudent}
          employmentStatus={getCurrentStatus(verificationModalStudent)}
          recruiterInfo={recruiterInfo}
        />
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!isRecruiterInfoComplete() && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <ContactRound className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Complete Your Information
              </h3>
              <p className="text-blue-700">
                Please fill in your recruiter information above to start
                verifying student placements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isRecruiterInfoComplete() && !selectedCompany && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Select a Company
              </h3>
              <p className="text-blue-700">
                Choose a company from the dropdown above to view and verify
                student placements.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
