import axiosInstance from "@/axios/axios.config";
import type { PaginationMeta } from "@/features/orders/schemas/types";

export type UserRole = "CUSTOMER" | "ADMIN";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface UsersResponse {
  data: AdminUser[];
  meta: PaginationMeta;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | "All";
  suspended?: "All" | "Active" | "Suspended";
}

export const getUsers = async (
  params: GetUsersParams = {},
): Promise<UsersResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.role && params.role !== "All") query.set("role", params.role);
  if (params.suspended === "Active") query.set("suspended", "false");
  if (params.suspended === "Suspended") query.set("suspended", "true");

  const { data } = await axiosInstance.get(`/users?${query.toString()}`);
  return data;
};

export const updateUserRole = async (
  userId: string,
  role: UserRole,
): Promise<AdminUser> => {
  const { data } = await axiosInstance.patch(`/users/${userId}/role`, { role });
  return data;
};

export const suspendUser = async (userId: string): Promise<AdminUser> => {
  const { data } = await axiosInstance.patch(`/users/${userId}/suspend`);
  return data;
};

export const reactivateUser = async (userId: string): Promise<AdminUser> => {
  const { data } = await axiosInstance.patch(`/users/${userId}/reactivate`);
  return data;
};
