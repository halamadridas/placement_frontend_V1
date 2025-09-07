import React, { useEffect, useMemo, useState, useRef } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Download,
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  GraduationCap,
  Star,
  Camera,
  Filter,
  Calendar,
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const CORRECT_PASSWORD = "1234";

const normalizeEmployment = (raw) => {
  if (!raw) return "unknown";
  const s = String(raw).toLowerCase().trim();
  if (["joined", "working", "still_working", "active"].includes(s))
    return "joined";
  if (["left_company", "left", "resigned"].includes(s)) return "left";
  if (["not_joined", "notjoined"].includes(s)) return "not_joined";
  if (["pending"].includes(s)) return "pending";
  return "unknown";
};

const getStatusColor = (status) => {
  switch (normalizeEmployment(status)) {
    case "joined":
      return "bg-green-100 text-green-800";
    case "left":
      return "bg-orange-100 text-orange-800";
    case "not_joined":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getVerificationIcon = (isVerified) => {
  return isVerified ? (
    <CheckCircle className="h-4 w-4 text-green-500" />
  ) : (
    <XCircle className="h-4 w-4 text-red-500" />
  );
};

const PasswordDialog = ({ isOpen, onPasswordCorrect }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading for better UX
    setTimeout(() => {
      if (password === CORRECT_PASSWORD) {
        onPasswordCorrect();
        setPassword("");
      } else {
        setError("Incorrect password. Please try again.");
      }
      setIsLoading(false);
    }, 500);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  return (
    <Dialog defaultOpen={{}} open={isOpen} onOpenChange={() => {}} >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Access Protected Content
          </DialogTitle>
          <DialogDescription>
            This dashboard contains sensitive placement data. Please enter the
            administrator password to continue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter administrator password"
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!password || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Access Dashboard
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        <div className="text-xs text-center text-gray-500 mt-4">
          Only authorized personnel can access placement statistics
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CompanyStats = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const dashboardRef = useRef(null);

  // Mock data since we can't make actual API calls in this environment
  const mockStudents = [
    {
      _id: "1",
      name: "John Smith",
      registrationNumber: "CS2021001",
      course: "Computer Science",
      batchStartYear: 2021,
      batchEndYear: 2025,
      isPlaced: true,
      company: "TechCorp",
      package: 8.5,
      employmentStatus: "joined",
      isVerified: true,
      recruiterRating: 4.5,
      studentFeedback: "Great experience",
      recruiterFeedback: "Excellent performer",
      submittedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    },
    {
      _id: "2",
      name: "Sarah Johnson",
      registrationNumber: "ME2021002",
      course: "Mechanical Engineering",
      batchStartYear: 2021,
      batchEndYear: 2025,
      isPlaced: true,
      company: "AutoMotive Inc",
      package: 6.5,
      employmentStatus: "joined",
      isVerified: true,
      recruiterRating: 4.2,
      studentFeedback: "Good learning opportunity",
      recruiterFeedback: "Strong technical skills",
      submittedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    },
    {
      _id: "3",
      name: "Mike Wilson",
      registrationNumber: "ECE2021003",
      course: "Electronics & Communication",
      batchStartYear: 2021,
      batchEndYear: 2025,
      isPlaced: false,
      company: null,
      package: null,
      employmentStatus: "pending",
      isVerified: false,
      recruiterRating: null,
      studentFeedback: null,
      recruiterFeedback: null,
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
    },
    {
      _id: "4",
      name: "Emily Davis",
      registrationNumber: "CS2020001",
      course: "Computer Science",
      batchStartYear: 2020,
      batchEndYear: 2024,
      isPlaced: true,
      company: "DataSys",
      package: 12.0,
      employmentStatus: "left",
      isVerified: true,
      recruiterRating: 4.8,
      studentFeedback: "Challenging work environment",
      recruiterFeedback: "Top performer",
      submittedAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    },
    {
      _id: "5",
      name: "Alex Brown",
      registrationNumber: "IT2021004",
      course: "Information Technology",
      batchStartYear: 2021,
      batchEndYear: 2025,
      isPlaced: true,
      company: "CloudTech",
      package: 9.5,
      employmentStatus: "joined",
      isVerified: false,
      recruiterRating: 4.3,
      studentFeedback: "Great team culture",
      recruiterFeedback: "Quick learner",
      submittedAt: new Date().toISOString(),
      verifiedAt: null,
    },
  ];

  const API_BASE_URL = `${import.meta.env.VITE_APP_API_URL}/api`

useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch all students data
          const studentsResponse = await fetch(
            // "http://localhost:5000/api/students?limit=infinite"
            `${API_BASE_URL}/students?limit=infinite`
          );

          if (studentsResponse.ok) {
            const data = await studentsResponse.json();
            console.log("API Response:", data);

            // Handle the nested response structure
            if (data.success && data.students) {
              setStudents(data.students);
            } else if (Array.isArray(data)) {
              // If the API returns array directly
              setStudents(data);
            } else {
              console.error("Unexpected API response format:", data);
              setStudents([]);
            }
          } else {
            console.error("Failed to fetch students data");
            setStudents([]);
          }
        } catch (error) {
          console.error("Error fetching students data:", error);
          setStudents([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isAuthenticated]);


  const handlePasswordCorrect = () => {
    setIsAuthenticated(true);
  };

  // Get unique values for filters
  const { companies, courses, batches, employmentStatuses } = useMemo(() => {
    const companies = [
      ...new Set(students.filter((s) => s.company).map((s) => s.company)),
    ].sort();
    const courses = [...new Set(students.map((s) => s.course))].sort();
    const batches = [...new Set(students.map((s) => s.batchStartYear))].sort(
      (a, b) => b - a
    );
    const statuses = [
      ...new Set(students.map((s) => s.employmentStatus)),
    ].filter(Boolean);
    return { companies, courses, batches, employmentStatuses: statuses };
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      if (selectedCompany !== "all" && student.company !== selectedCompany)
        return false;
      if (selectedCourse !== "all" && student.course !== selectedCourse)
        return false;
      if (
        selectedBatch !== "all" &&
        student.batchStartYear !== parseInt(selectedBatch)
      )
        return false;
      if (
        selectedStatus !== "all" &&
        normalizeEmployment(student.employmentStatus) !== selectedStatus
      )
        return false;
      if (selectedVerification !== "all") {
        if (selectedVerification === "verified" && !student.isVerified)
          return false;
        if (selectedVerification === "unverified" && student.isVerified)
          return false;
      }
      if (
        searchTerm &&
        !student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !student.registrationNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "package") {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    students,
    selectedCompany,
    selectedCourse,
    selectedBatch,
    selectedStatus,
    selectedVerification,
    searchTerm,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedStudents, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = filteredAndSortedStudents.length;
    const placed = filteredAndSortedStudents.filter((s) => s.isPlaced).length;
    const verified = filteredAndSortedStudents.filter(
      (s) => s.isVerified
    ).length;
    const placementRate = total > 0 ? ((placed / total) * 100).toFixed(1) : 0;

    const placedStudents = filteredAndSortedStudents.filter(
      (s) => s.isPlaced && s.package
    );
    const avgPackage =
      placedStudents.length > 0
        ? (
            placedStudents.reduce((sum, s) => sum + (s.package || 0), 0) /
            placedStudents.length
          ).toFixed(2)
        : 0;

    const ratedStudents = filteredAndSortedStudents.filter(
      (s) => s.recruiterRating
    );
    const avgRating =
      ratedStudents.length > 0
        ? (
            ratedStudents.reduce((sum, s) => sum + s.recruiterRating, 0) /
            ratedStudents.length
          ).toFixed(1)
        : 0;

    const highestPackage =
      placedStudents.length > 0
        ? Math.max(...placedStudents.map((s) => s.package || 0)).toFixed(2)
        : 0;

    return {
      total,
      placed,
      verified,
      placementRate,
      avgPackage,
      avgRating,
      highestPackage,
    };
  }, [filteredAndSortedStudents]);

  // Company-wise statistics
  const companyStats = useMemo(() => {
    const stats = {};
    filteredAndSortedStudents
      .filter((s) => s.isPlaced && s.company)
      .forEach((s) => {
        if (!stats[s.company]) {
          stats[s.company] = {
            count: 0,
            packageSum: 0,
            ratingSum: 0,
            ratingCount: 0,
            packages: [],
          };
        }
        stats[s.company].count += 1;
        if (s.package) {
          stats[s.company].packageSum += s.package;
          stats[s.company].packages.push(s.package);
        }
        if (s.recruiterRating) {
          stats[s.company].ratingSum += s.recruiterRating;
          stats[s.company].ratingCount += 1;
        }
      });

    return Object.entries(stats)
      .map(([company, data]) => ({
        company,
        count: data.count,
        avgPackage:
          data.packages.length > 0
            ? (data.packageSum / data.packages.length).toFixed(2)
            : 0,
        maxPackage:
          data.packages.length > 0 ? Math.max(...data.packages).toFixed(2) : 0,
        avgRating:
          data.ratingCount > 0
            ? (data.ratingSum / data.ratingCount).toFixed(1)
            : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredAndSortedStudents]);

  // Course-wise statistics
  const courseStats = useMemo(() => {
    const stats = {};
    filteredAndSortedStudents.forEach((s) => {
      if (!stats[s.course]) {
        stats[s.course] = { total: 0, placed: 0 };
      }
      stats[s.course].total += 1;
      if (s.isPlaced) stats[s.course].placed += 1;
    });

    return Object.entries(stats).map(([course, data]) => ({
      course,
      total: data.total,
      placed: data.placed,
      placementRate: ((data.placed / data.total) * 100).toFixed(1),
    }));
  }, [filteredAndSortedStudents]);

  // Employment status distribution
  const employmentStats = useMemo(() => {
    const stats = { joined: 0, left: 0, not_joined: 0, pending: 0, unknown: 0 };
    filteredAndSortedStudents.forEach((s) => {
      const status = normalizeEmployment(s.employmentStatus);
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }, [filteredAndSortedStudents]);

  // Batch-wise placement trends
  const batchStats = useMemo(() => {
    const stats = {};
    filteredAndSortedStudents.forEach((s) => {
      const year = s.batchEndYear || s.batchStartYear + 4;
      if (!stats[year]) {
        stats[year] = { total: 0, placed: 0 };
      }
      stats[year].total += 1;
      if (s.isPlaced) stats[year].placed += 1;
    });

    return Object.entries(stats)
      .map(([year, data]) => ({
        year: parseInt(year),
        total: data.total,
        placed: data.placed,
        placementRate: ((data.placed / data.total) * 100).toFixed(1),
      }))
      .sort((a, b) => a.year - b.year);
  }, [filteredAndSortedStudents]);

  // Chart data
  const companyChartData = {
    labels: companyStats.slice(0, 10).map((c) => c.company),
    datasets: [
      {
        label: "Students Placed",
        data: companyStats.slice(0, 10).map((c) => c.count),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const employmentPieData = {
    labels: ["Joined", "Left Company", "Not Joined", "Pending"],
    datasets: [
      {
        data: [
          employmentStats.joined,
          employmentStats.left,
          employmentStats.not_joined,
          employmentStats.pending,
          employmentStats.unknown,
        ],
        backgroundColor: [
          "#22c55e",
          "#f97316",
          "#ef4444",
          "#eab308",
          "#6b7280",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const coursePlacementData = {
    labels: courseStats.map((c) => c.course),
    datasets: [
      {
        label: "Total Students",
        data: courseStats.map((c) => c.total),
        backgroundColor: "rgba(156, 163, 175, 0.8)",
        borderColor: "rgba(156, 163, 175, 1)",
        borderWidth: 1,
      },
      {
        label: "Placed Students",
        data: courseStats.map((c) => c.placed),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  const batchTrendData = {
    labels: batchStats.map((b) => b.year.toString()),
    datasets: [
      {
        label: "Placement Rate (%)",
        data: batchStats.map((b) => parseFloat(b.placementRate)),
        borderColor: "rgba(168, 85, 247, 1)",
        backgroundColor: "rgba(168, 85, 247, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const packageDistributionData = {
    labels: ["0-3 LPA", "3-5 LPA", "5-8 LPA", "8-12 LPA", "12+ LPA"],
    datasets: [
      {
        data: [
          filteredAndSortedStudents.filter((s) => s.package && s.package < 3)
            .length,
          filteredAndSortedStudents.filter(
            (s) => s.package && s.package >= 3 && s.package < 5
          ).length,
          filteredAndSortedStudents.filter(
            (s) => s.package && s.package >= 5 && s.package < 8
          ).length,
          filteredAndSortedStudents.filter(
            (s) => s.package && s.package >= 8 && s.package < 12
          ).length,
          filteredAndSortedStudents.filter((s) => s.package && s.package >= 12)
            .length,
        ],
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#059669",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const resetFilters = () => {
    setSelectedCompany("all");
    setSelectedCourse("all");
    setSelectedBatch("all");
    setSelectedStatus("all");
    setSelectedVerification("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const exportData = filteredAndSortedStudents.map((s) => ({
      Name: s.name,
      "Registration Number": s.registrationNumber,
      Course: s.course,
      "Batch Start Year": s.batchStartYear,
      "Batch End Year": s.batchEndYear,
      "Is Placed": s.isPlaced ? "Yes" : "No",
      Company: s.company || "N/A",
      "Package (LPA)": s.package || "N/A",
      "Employment Status": s.employmentStatus,
      "Is Verified": s.isVerified ? "Yes" : "No",
      "Recruiter Rating": s.recruiterRating || "N/A",
      "Student Feedback": s.studentFeedback || "N/A",
      "Recruiter Feedback": s.recruiterFeedback || "N/A",
      "Submitted At": s.submittedAt
        ? new Date(s.submittedAt).toLocaleString()
        : "N/A",
      "Verified At": s.verifiedAt
        ? new Date(s.verifiedAt).toLocaleString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Add summary sheet
    const summaryData = [
      ["Metric", "Value"],
      ["Total Students", metrics.total],
      ["Placed Students", metrics.placed],
      ["Placement Rate (%)", metrics.placementRate],
      ["Average Package (LPA)", metrics.avgPackage],
      ["Highest Package (LPA)", metrics.highestPackage],
      ["Average Rating", metrics.avgRating],
      ["Verified Students", metrics.verified],
    ];

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      data,
      'placement_analytics_${new Date().toISOString().split("T")[0]}.xlsx'
    );
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStudents([]);
    // Reset all filters and states
    setSelectedCompany("all");
    setSelectedCourse("all");
    setSelectedBatch("all");
    setSelectedStatus("all");
    setSelectedVerification("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Show password dialog if not authenticated
  if (!isAuthenticated) {
    return (
      <PasswordDialog isOpen={true} onPasswordCorrect={handlePasswordCorrect} />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading placement data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" ref={dashboardRef}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Placement Analytics Dashboard
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-800"
              >
                Authenticated
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive placement statistics and insights
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex gap-2"
            >
              <Lock className="h-4 w-4" /> Logout
            </Button>
            <Button
              onClick={handlePrintReport}
              variant="outline"
              className="flex gap-2"
            >
              <FileText className="h-4 w-4" /> Print Report
            </Button>
            <Button onClick={handleExportExcel} className="flex gap-2">
              <Download className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between">
              <Users className="h-8 w-8 mb-2 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between">
              <GraduationCap className="h-8 w-8 mb-2 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Placed</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.placed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between">
              <TrendingUp className="h-8 w-8 mb-2 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Placement Rate
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.placementRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between">
              <DollarSign className="h-8 w-8 mb-2 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Package</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.avgPackage} LPA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between">
              <TrendingUp className="h-8 w-8 mb-2 text-green-600" />

              <div>
                <p className="text-sm font-medium text-gray-600">
                  Highest Package
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.highestPackage} LPA
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col  items-center justify-between">
              <Star className="h-8 w-8 mb-2 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-purple-600">
                  {metrics.avgRating}/5
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-between">
              <CheckCircle className="h-8 w-8 text-indigo-600" />

              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {metrics.verified}
                </p>
                <p className="text-sm font-medium text-gray-600">
                  {metrics.total - metrics.verified} remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or registration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Select
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Batch Year
              </label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch.toString()}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Employment Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="joined">Joined</SelectItem>
                  <SelectItem value="left">Left Company</SelectItem>
                  <SelectItem value="not_joined">Not Joined</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Verification
              </label>
              <Select
                value={selectedVerification}
                onValueChange={setSelectedVerification}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={resetFilters} variant="outline" size="sm">
              Reset Filters
            </Button>
            <Badge variant="secondary" className="ml-auto">
              {filteredAndSortedStudents.length} students found
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Company-wise Placements */}
        <Card>
          <CardHeader>
            <CardTitle>Top Companies by Placement Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={companyChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Employment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie data={employmentPieData} />
            </div>
          </CardContent>
        </Card>

        {/* Course-wise Placement */}
        <Card>
          <CardHeader>
            <CardTitle>Course-wise Placement Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Bar data={coursePlacementData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Package Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Package Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={packageDistributionData} />
            </div>
          </CardContent>
        </Card>

        {/* Batch-wise Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Placement Rate Trends by Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={batchTrendData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Statistics Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Company-wise Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Students Placed</TableHead>
                  <TableHead className="text-right">
                    Avg Package (LPA)
                  </TableHead>
                  <TableHead className="text-right">
                    Max Package (LPA)
                  </TableHead>
                  <TableHead className="text-right">Avg Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyStats.map((company) => (
                  <TableRow key={company.company}>
                    <TableCell className="font-medium">
                      {company.company}
                    </TableCell>
                    <TableCell className="text-right">
                      {company.count}
                    </TableCell>
          <TableCell className="text-right">
            &#8377;{company.avgPackage}
          </TableCell>
          <TableCell className="text-right">
            &#8377;{company.maxPackage}
          </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {company.avgRating}
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Course-wise Placement Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Total Students</TableHead>
                  <TableHead className="text-right">Placed Students</TableHead>
                  <TableHead className="text-right">Placement Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseStats.map((course) => (
                  <TableRow key={course.course}>
                    <TableCell className="font-medium">
                      {course.course}
                    </TableCell>
                    <TableCell className="text-right">{course.total}</TableCell>
                    <TableCell className="text-right">
                      {course.placed}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          parseFloat(course.placementRate) >= 70
                            ? "default"
                            : "secondary"
                        }
                        className={
                          parseFloat(course.placementRate) >= 70
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {course.placementRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Students Data Table */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Student Details</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Showing{" "}
                {Math.min(itemsPerPage, filteredAndSortedStudents.length)} of{" "}
                {filteredAndSortedStudents.length} students
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("name")}
                      className="h-auto p-0 font-medium"
                    >
                      Name
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("registrationNumber")}
                      className="h-auto p-0 font-medium"
                    >
                      Registration No.
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("course")}
                      className="h-auto p-0 font-medium"
                    >
                      Course
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("batchStartYear")}
                      className="h-auto p-0 font-medium"
                    >
                      Batch
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("package")}
                      className="h-auto p-0 font-medium"
                    >
                      Package (LPA)
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Employment Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.registrationNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.course}</Badge>
                    </TableCell>
                    <TableCell>
                      {student.batchStartYear}-{student.batchEndYear}
                    </TableCell>
                    <TableCell>
                      {student.company ? (
                        <Badge variant="secondary">{student.company}</Badge>
                      ) : (
                        <span className="text-gray-400">Not Placed</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {student.package ? `₹${student.package}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(student.employmentStatus)}
                      >
                        {student.employmentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getVerificationIcon(student.isVerified)}
                        <span className="text-sm">
                          {student.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {student.recruiterRating ? (
                        <div className="flex items-center justify-end gap-1">
                          {student.recruiterRating}
                          <Star className="h-4 w-4 text-yellow-500" />
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Trend Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Batch-wise Performance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Graduation Year</TableHead>
                  <TableHead className="text-right">Total Students</TableHead>
                  <TableHead className="text-right">Placed Students</TableHead>
                  <TableHead className="text-right">Placement Rate</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchStats.map((batch) => (
                  <TableRow key={batch.year}>
                    <TableCell className="font-medium">{batch.year}</TableCell>
                    <TableCell className="text-right">{batch.total}</TableCell>
                    <TableCell className="text-right">{batch.placed}</TableCell>
                    <TableCell className="text-right">
                      {batch.placementRate}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          parseFloat(batch.placementRate) >= 80
                            ? "default"
                            : parseFloat(batch.placementRate) >= 60
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          parseFloat(batch.placementRate) >= 80
                            ? "bg-green-100 text-green-800"
                            : parseFloat(batch.placementRate) >= 60
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {parseFloat(batch.placementRate) >= 80
                          ? "Excellent"
                          : parseFloat(batch.placementRate) >= 60
                          ? "Good"
                          : "Needs Improvement"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-600">Strengths</h4>
              <ul className="space-y-2 text-sm">
                {parseFloat(metrics.placementRate) >= 70 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Strong overall placement rate of {metrics.placementRate}%
                  </li>
                )}
                {companyStats.length > 0 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Good industry connections with {companyStats.length}{" "}
                    recruiting companies
                  </li>
                )}
                {parseFloat(metrics.avgPackage) >= 5 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Competitive average package of ₹{metrics.avgPackage} LPA
                  </li>
                )}
                {parseFloat(metrics.avgRating) >= 4 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    High employer satisfaction with average rating of{" "}
                    {metrics.avgRating}/5
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-orange-600">
                Areas for Improvement
              </h4>
              <ul className="space-y-2 text-sm">
                {parseFloat(metrics.placementRate) < 70 && (
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Focus on improving placement rate (currently{" "}
                    {metrics.placementRate}%)
                  </li>
                )}
                {employmentStats.not_joined > employmentStats.joined && (
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Address high "not joined" rate - improve offer conversion
                  </li>
                )}
                {metrics.verified < metrics.total * 0.8 && (
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Increase verification rate for better data accuracy
                  </li>
                )}
                {courseStats.some((c) => parseFloat(c.placementRate) < 50) && (
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    Some courses need targeted placement support
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};
 
export default CompanyStats;
