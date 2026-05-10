import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface SalesData {
  date: string;
  revenue: string | number;
  transactions_count: number;
}

export interface SellerData {
  seller_id: string;
  username: string;
  avatar_url: string | null;
  total_sales: string | number;
  transaction_count: number;
  rating: string | number;
}

export interface CategoryData {
  category_id: string;
  category_name: string;
  part_count: number;
  total_value: string | number;
}

export interface UserGrowthData {
  month_date: string;
  new_users: number;
  total_users: number;
}

export interface BrandData {
  brand_id: string;
  brand_name: string;
  logo_url: string | null;
  part_count: number;
  total_value: string | number;
}

export interface TransactionStatusData {
  status: string;
  count: number;
  total_amount: string | number;
}

export interface RecentTransaction {
  id: string;
  buyer_name: string | null;
  seller_name: string | null;
  part_title: string | null;
  amount: string | number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
}

export interface DailyStats {
  today_revenue: string | number;
  today_transactions: number;
  yesterday_revenue: string | number;
  yesterday_transactions: number;
  active_listings: number;
  total_users: number;
  total_parts: number;
}

export type DailyStatsData = DailyStats | null;

export interface FinancialData {
  total_gmv: string | number;
  completed_revenue: string | number;
  retained_escrow: string | number;
  current_month_revenue: string | number;
  previous_month_revenue: string | number;
  total_transactions_count: number;
}

export interface AnalyticsData {
  sales: { sales: SalesData[]; period: number; total: number };
  sellers: { sellers: SellerData[] };
  categories: { categories: CategoryData[] };
  users: { growth: UserGrowthData[]; months: number; total: number };
  brands: { brands: BrandData[] };
  status: { status: TransactionStatusData[] };
  daily: DailyStats | null;
  recent: { transactions: RecentTransaction[] };
  financial: FinancialData | null;
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.analytics.all() as Promise<AnalyticsData>,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
}

export function useSalesByDate(days = 7) {
  return useQuery({
    queryKey: ['analytics', 'sales', days],
    queryFn: () => api.analytics.sales(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopSellers(limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'sellers', limit],
    queryFn: () => api.analytics.sellers(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePartsByCategory() {
  return useQuery({
    queryKey: ['analytics', 'categories'],
    queryFn: () => api.analytics.categories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserGrowth() {
  return useQuery({
    queryKey: ['analytics', 'users'],
    queryFn: () => api.analytics.users(),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularBrands(limit = 5) {
  return useQuery({
    queryKey: ['analytics', 'brands', limit],
    queryFn: () => api.analytics.brands(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransactionStatus() {
  return useQuery({
    queryKey: ['analytics', 'status'],
    queryFn: () => api.analytics.status(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDailyStats() {
  return useQuery({
    queryKey: ['analytics', 'daily'],
    queryFn: () => api.analytics.daily(),
    staleTime: 1 * 60 * 1000,
  });
}

export function useRecentTransactions(limit = 10) {
  return useQuery({
    queryKey: ['analytics', 'recent', limit],
    queryFn: () => api.analytics.recent(limit),
    staleTime: 2 * 60 * 1000,
  });
}
