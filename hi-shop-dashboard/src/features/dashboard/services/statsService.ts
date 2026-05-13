import axiosInstance from "@/axios/axios.config";

export interface StatsResponse {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: string;
  totalCustomers: number;
  ordersByStatus: Record<string, number>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: string | number;
    status: string;
    createdAt: string;
  }>;
}

export const getStats = async (): Promise<StatsResponse> => {
  const response = await axiosInstance.get("/stats");
  return response.data;
};
