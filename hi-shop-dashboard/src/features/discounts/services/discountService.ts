import axiosInstance from "@/axios/axios.config";
import type { PaginationMeta } from "@/features/orders/schemas/types";

export interface Discount {
  id: string;
  code: string;
  description: string | null;
  discountPct: number | null;
  discountAmt: number | null;
  minOrderAmt: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DiscountValues {
  code: string;
  description?: string;
  discountPct?: number;
  discountAmt?: number;
  minOrderAmt?: number;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

interface DiscountsResponse {
  data: Discount[];
  meta: PaginationMeta;
}

export const getDiscounts = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "All" | "Active" | "Inactive";
}): Promise<DiscountsResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.isActive === "Active") query.set("isActive", "true");
  if (params.isActive === "Inactive") query.set("isActive", "false");
  const { data } = await axiosInstance.get(`/discounts?${query.toString()}`);
  return data;
};

export const createDiscount = async (
  values: DiscountValues,
): Promise<Discount> => {
  const { data } = await axiosInstance.post("/discounts", values);
  return data;
};

export const updateDiscount = async (
  id: string,
  values: Partial<DiscountValues>,
): Promise<Discount> => {
  const { data } = await axiosInstance.patch(`/discounts/${id}`, values);
  return data;
};

export const deactivateDiscount = async (id: string): Promise<Discount> => {
  const { data } = await axiosInstance.patch(`/discounts/${id}/deactivate`);
  return data;
};
