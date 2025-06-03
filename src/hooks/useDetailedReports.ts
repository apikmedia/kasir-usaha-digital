
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { BusinessType } from '@/types/order';

interface ReportData {
  business_type: BusinessType;
  report_type: string;
  period: {
    start_date: string;
    end_date: string;
  };
  revenue_trend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  order_statistics: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  generated_at: string;
}

interface ReportErrorResponse {
  error: string;
}

export const useDetailedReports = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async (
    businessType: BusinessType,
    reportType: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReportData | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('generate_detailed_report', {
        p_business_type: businessType,
        p_report_type: reportType,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error generating report:', error);
        throw error;
      }

      // Type guard to check if the response contains an error
      const response = data as unknown as ReportData | ReportErrorResponse;
      
      if ('error' in response) {
        toast({
          title: "Premium Required",
          description: response.error,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Laporan Berhasil Dibuat",
        description: "Laporan detail telah berhasil dihasilkan",
      });

      return response as ReportData;
    } catch (error) {
      console.error('Error in generateReport:', error);
      toast({
        title: "Error",
        description: "Gagal membuat laporan detail",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async (reportData: ReportData): Promise<boolean> => {
    try {
      // This would integrate with a PDF generation service
      // For now, we'll simulate the functionality
      toast({
        title: "Export PDF",
        description: "Fitur export PDF akan segera tersedia",
      });
      return true;
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "Error",
        description: "Gagal export ke PDF",
        variant: "destructive",
      });
      return false;
    }
  };

  const exportToExcel = async (reportData: ReportData): Promise<boolean> => {
    try {
      // This would integrate with an Excel generation service
      // For now, we'll simulate the functionality
      toast({
        title: "Export Excel",
        description: "Fitur export Excel akan segera tersedia",
      });
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error",
        description: "Gagal export ke Excel",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    loading,
    generateReport,
    exportToPDF,
    exportToExcel
  };
};
