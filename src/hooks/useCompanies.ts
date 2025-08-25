import { useState, useCallback } from 'react';
import type { Company, CompanyStats, ApiResponse } from '../lib/types';
import { getCompanies, getCompanyStats, getCompanyDetails } from '../lib/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompanies();
      if (response.success && response.data) {
        setCompanies(response.data);
      } else {
        setError(response.error || 'Failed to fetch companies');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompanyStats();
      if (response.success && response.data) {
        setCompanyStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch company stats');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanyDetails = useCallback(async (companyName: string): Promise<ApiResponse<Company>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCompanyDetails(companyName);
      if (!response.success) {
        setError(response.error || 'Failed to fetch company details');
      }
      return response;
    } catch (err) {
      const errorResponse: ApiResponse<Company> = {
        success: false,
        error: 'An unexpected error occurred',
      };
      setError(errorResponse.error || 'An unexpected error occurred');
      return errorResponse;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    companies,
    companyStats,
    loading,
    error,
    fetchCompanies,
    fetchCompanyStats,
    fetchCompanyDetails,
    clearError,
  };
};
