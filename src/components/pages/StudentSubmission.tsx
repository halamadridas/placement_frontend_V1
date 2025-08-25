import React from 'react';
import { StudentForm } from '../forms/StudentForm';
import { Button } from '../ui/button';
import { ArrowLeft, User } from 'lucide-react';
type Page = "home" | "submit" | "verify" | "stats";

interface StudentSubmissionProps {
  onNavigate: (page: Page) => void;
}

export function StudentSubmission({ onNavigate }: StudentSubmissionProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Student Placement Submission</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Submit your placement information for verification. This helps us track placement statistics 
          and provide insights to future students.
        </p>
      </div>

      {/* Form */}
      <StudentForm />
    </div>
  );
}
