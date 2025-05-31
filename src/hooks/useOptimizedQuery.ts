
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

type TableName = 'orders' | 'customers' | 'services' | 'products' | 'profiles' | 'transactions';

interface QueryConfig {
  queryKey: string[];
  table: TableName;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  pageSize?: number;
  businessType?: string;
}

interface QueryResult {
  data: any[];
  hasMore: boolean;
}

export const useOptimizedQuery = (config: QueryConfig) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchData = async ({ pageParam = 0 }): Promise<QueryResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const pageSize = config.pageSize || 50;
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      // Use any type to avoid deep type instantiation issues
      const baseQuery: any = supabase
        .from(config.table)
        .select(config.select || '*', { count: 'exact' });

      // Build query step by step to avoid complex type inference
      let finalQuery = baseQuery.eq('user_id', user.id);

      // Add filters
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            finalQuery = finalQuery.eq(key, value);
          }
        });
      }

      // Add ordering
      if (config.orderBy) {
        finalQuery = finalQuery.order(config.orderBy.column, { 
          ascending: config.orderBy.ascending ?? true 
        });
      }

      // Add pagination
      finalQuery = finalQuery.range(from, to);

      // Execute query with explicit typing
      const result = await finalQuery;

      if (result.error) throw result.error;

      // Ensure data is always an array
      const responseData = Array.isArray(result.data) ? result.data : [];
      const hasMore = result.count ? (from + pageSize) < result.count : false;

      return { 
        data: responseData, 
        hasMore 
      };
    } catch (error) {
      console.error(`Error fetching ${config.table}:`, error);
      toast({
        title: "Error",
        description: `Gagal memuat data ${config.table}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const query = useQuery({
    queryKey: config.queryKey,
    queryFn: () => fetchData({ pageParam: 0 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: config.queryKey });
  }, [queryClient, config.queryKey]);

  const prefetchNext = useCallback((pageParam: number) => {
    queryClient.prefetchQuery({
      queryKey: [...config.queryKey, 'page', pageParam + 1],
      queryFn: () => fetchData({ pageParam: pageParam + 1 }),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, config.queryKey]);

  return {
    data: query.data?.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate: invalidateQuery,
    prefetchNext,
    hasMore: query.data?.hasMore || false
  };
};
