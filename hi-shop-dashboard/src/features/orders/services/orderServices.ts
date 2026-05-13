import axiosInstance from "@/axios/axios.config";
import type {
  Order,
  OrderStatus,
  OrderStatusLog,
  PaginationMeta,
  UpdateShippingValues,
} from "../schemas/types";

export interface OrdersResponse {
  data: Order[];
  meta: PaginationMeta;
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus | "All";
}

export const getOrders = async (params?: GetOrdersParams): Promise<OrdersResponse> => {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.status && params.status !== "All") query.set("status", params.status);

  const response = await axiosInstance.get(`/orders?${query.toString()}`);
  return response.data;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> => {
  const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
    status,
    ...(note?.trim() ? { note: note.trim() } : {}),
  });
  return response.data;
};

export const updateOrderShipping = async (
  orderId: string,
  values: UpdateShippingValues,
): Promise<Order> => {
  const payload = Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  );
  const response = await axiosInstance.patch(`/orders/${orderId}/shipping`, payload);
  return response.data;
};

export const getOrderStatusLogs = async (
  orderId: string,
): Promise<OrderStatusLog[]> => {
  const response = await axiosInstance.get(`/orders/${orderId}/status-logs`);
  return response.data;
};
