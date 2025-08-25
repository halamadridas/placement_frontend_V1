import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentFormSchema, type StudentFormData } from '../../lib/validations';
import { useStudents } from '../../hooks/useStudents';
import { CompanySearch } from './CompanySearch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Loader2, CheckCircle, AlertCircle, User, BookOpen, Calendar, Building2, DollarSign, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export function StudentForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<StudentFormData | null>(null);
  const { createStudent, loading, error, clearError } = useStudents();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      registrationNumber: '',
      course: '',
      batchStartYear: new Date().getFullYear(),
      batchEndYear: new Date().getFullYear() + 4,
      isPlaced: false,
      company: '',
      package: undefined,
      studentFeedback: '',
      
    },
  });

  const isPlaced = watch('isPlaced');
  const currentYear = new Date().getFullYear();

  const onSubmit = async (data: StudentFormData) => {
    try {
      clearError();
      const response = await createStudent(data);
      console.log('API Response: after submit', response); // Add this log
      if (response.success) {
        setSubmittedData(data);
        setIsSubmitted(true);
        reset();
        toast.success('Student placement submitted successfully!');
      } else {
        toast.error(response.error || 'Failed to submit student data');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    reset();
    clearError();
  };

  if (isSubmitted && submittedData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-600">Submission Successful!</CardTitle>
          <CardDescription>
            Your student placement information has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Name:</span> {submittedData.name}
              </div>
              <div>
                <span className="font-semibold">Registration:</span> {submittedData.registrationNumber}
              </div>
              <div>
                <span className="font-semibold">Course:</span> {submittedData.course}
              </div>
              <div>
                <span className="font-semibold">Batch:</span> {submittedData.batchStartYear} - {submittedData.batchEndYear}
              </div>
              {submittedData.isPlaced && (
                <>
                  <div>
                    <span className="font-semibold">Company:</span> {submittedData.company}
                  </div>
                  <div>
                    <span className="font-semibold">Package:</span> ₹{submittedData.package?.toLocaleString()}
                  </div>
                </>
              )}
            </div>
            <Separator />
            <div className="flex gap-2 justify-center">
              <Button onClick={handleReset} variant="outline">
                Submit Another
              </Button>
              <Button onClick={() => window.print()}>
                Print Confirmation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Student Placement Submission
        </CardTitle>
        <CardDescription>
          Submit your placement information for verification and tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Enter your full name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  {...register('registrationNumber')}
                  placeholder="e.g., 2021CS001"
                  className={errors.registrationNumber ? 'border-red-500' : ''}
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.registrationNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Input
                id="course"
                {...register('course')}
                placeholder="e.g., Computer Science Engineering"
                className={errors.course ? 'border-red-500' : ''}
              />
              {errors.course && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.course.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="batchStartYear">Batch Start Year *</Label>
                <Input
                  id="batchStartYear"
                  type="number"
                  {...register('batchStartYear', { valueAsNumber: true })}
                  min={2010}
                  max={currentYear + 5}
                  className={errors.batchStartYear ? 'border-red-500' : ''}
                />
                {errors.batchStartYear && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.batchStartYear.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchEndYear">Batch End Year *</Label>
                <Input
                  id="batchEndYear"
                  type="number"
                  {...register('batchEndYear', { valueAsNumber: true })}
                  min={2010}
                  max={currentYear + 5}
                  className={errors.batchEndYear ? 'border-red-500' : ''}
                />
                {errors.batchEndYear && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.batchEndYear.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Placement Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Placement Status
            </h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPlaced"
                checked={isPlaced}
                onCheckedChange={(checked) => setValue('isPlaced', checked as boolean)}
              />
              <Label htmlFor="isPlaced" className="text-base">
                I have been placed in a company
              </Label>
            </div>

            {isPlaced && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <CompanySearch
                    value={watch('company')}
                    onValueChange={(value) => setValue('company', value)}
                    placeholder="Search or enter company name"
                  />
                  {errors.company && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="package">Package (LPA) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="package"
                      type="number"
                      {...register('package', { valueAsNumber: true })}
                      placeholder="e.g., 8.5"
                      min="0"
                      step="0.1"
                      className="pl-10"
                    />
                  </div>
                  {errors.package && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.package.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Feedback */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Additional Feedback (Optional)
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="studentFeedback">Your Experience & Feedback</Label>
              <Textarea
                id="studentFeedback"
                {...register('studentFeedback')}
                placeholder="Share your placement experience, interview process, or any feedback..."
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Optional feedback for future students</span>
                <span>{watch('studentFeedback')?.length || 0}/1000</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Placement Information
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Required fields. Your information will be verified by recruiters.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
