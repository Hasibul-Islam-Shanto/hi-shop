import axiosInstance from "@/axios/axios.config";
import type { PaginationMeta } from "@/features/orders/schemas/types";
import type { IProduct } from "@/features/products/schemas/types";

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ReviewsResponse {
  data: ProductReview[];
  meta: PaginationMeta;
}

export interface ProductsResponse {
  data: IProduct[];
  meta: PaginationMeta;
}

export const getReviewProducts = async (): Promise<IProduct[]> => {
  const { data } = await axiosInstance.get<ProductsResponse>("/products?limit=100&isActive=true");
  return data.data;
};

export const getProductReviews = async (
  productId: string,
  page = 1,
  limit = 20,
): Promise<ReviewsResponse> => {
  const { data } = await axiosInstance.get(
    `/products/${productId}/reviews?page=${page}&limit=${limit}`,
  );
  return data;
};

export const moderateReview = async (
  reviewId: string,
  isVisible: boolean,
): Promise<ProductReview> => {
  const { data } = await axiosInstance.patch(`/reviews/${reviewId}/moderation`, {
    isVisible,
  });
  return data;
};
