import axiosInstance from "@/axios/axios.config";
import type {
  ProductFormValues,
  UpdateProductValues,
  VariantFormValues,
  UpdateVariantValues,
  ImageFormValues,
  AdjustInventoryValues,
} from "../schemas/product.schema";
import type { IProduct, ProductsResponse } from "../schemas/types";

export const getProducts = async (page = 1, limit = 20): Promise<ProductsResponse> => {
  const response = await axiosInstance.get(`/products?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProduct = async (id: string): Promise<IProduct> => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: ProductFormValues) => {
  const response = await axiosInstance.post("/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: UpdateProductValues) => {
  const response = await axiosInstance.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/products/${id}`);
};

export const addVariant = async (productId: string, data: VariantFormValues) => {
  const response = await axiosInstance.post(`/products/${productId}/variants`, data);
  return response.data;
};

export const updateVariant = async (
  productId: string,
  variantId: string,
  data: UpdateVariantValues
) => {
  const response = await axiosInstance.patch(
    `/products/${productId}/variants/${variantId}`,
    data
  );
  return response.data;
};

export const deleteVariant = async (
  productId: string,
  variantId: string
): Promise<void> => {
  await axiosInstance.delete(`/products/${productId}/variants/${variantId}`);
};

export const adjustInventory = async (
  productId: string,
  variantId: string,
  data: AdjustInventoryValues,
) => {
  const response = await axiosInstance.patch(
    `/products/${productId}/variants/${variantId}/inventory`,
    data,
  );
  return response.data;
};

export const addImage = async (productId: string, data: ImageFormValues) => {
  const response = await axiosInstance.post(`/products/${productId}/images`, data);
  return response.data;
};

export const deleteImage = async (productId: string, imageId: string): Promise<void> => {
  await axiosInstance.delete(`/products/${productId}/images/${imageId}`);
};
