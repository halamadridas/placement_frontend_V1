import React from 'react';
import { RecruiterForm } from '../forms/RecruiterForm';
import { Button } from '../ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';

interface RecruiterVerificationProps {
  onNavigate: (page: string) => void;
}

export function RecruiterVerification({ onNavigate }: RecruiterVerificationProps) {
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
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Recruiter Verification</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Verify student placement information for your company. Review submissions and provide 
          feedback to help improve our placement process.
        </p>
      </div>

      {/* Form */}
      <RecruiterForm />
    </div>
  );
}
