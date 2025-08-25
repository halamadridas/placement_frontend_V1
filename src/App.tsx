import React, { useState } from "react";
import { Toaster } from "sonner";
import { Home } from "./components/pages/Home";
import { StudentSubmission } from "./components/pages/StudentSubmission";
import { RecruiterVerification } from "./components/pages/RecruiterVerification";
import "./App.css";
import CompanyStats from "./components/pages/CompanyStats";

type Page = "home" | "submit" | "verify" | "stats";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} />;
      case "submit":
        return <StudentSubmission onNavigate={setCurrentPage} />;
      case "verify":
        return <RecruiterVerification onNavigate={setCurrentPage} />;
      case "stats":
        return <CompanyStats onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <h1 className="text-xl font-bold">Placement System</h1>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => setCurrentPage("home")}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPage === "home"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setCurrentPage("submit")}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPage === "submit"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Submit Placement
                </button>
                <button
                  onClick={() => setCurrentPage("verify")}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPage === "verify"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Verify Students
                </button>
                <button
                  onClick={() => setCurrentPage("stats")}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    currentPage === "stats"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Statistics
                </button>
              </nav>

              {/* Mobile menu button */}
              <button className="md:hidden p-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">{renderPage()}</main>

        {/* Footer */}
        <footer className="border-t bg-muted/40">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                &copy; 2024 Student Placement Management System. All rights
                reserved.
              </p>
              <p className="mt-1">
                Built with React, TypeScript, and ShadCN UI
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Toast notifications */}
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
