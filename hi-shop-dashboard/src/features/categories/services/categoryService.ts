import axiosInstance from "@/axios/axios.config";
import type {
  CreateCategoryValues,
  UpdateCategoryValues,
  CategoryItem,
} from "../schemas/category.schema";

export const fetchCategoriesFlat = async (): Promise<CategoryItem[]> => {
  const { data } = await axiosInstance.get("/categories?flat=true");
  return data;
};

export const createCategory = async (dto: CreateCategoryValues) => {
  const { data } = await axiosInstance.post("/categories", dto);
  return data;
};

export const updateCategory = async (id: string, dto: UpdateCategoryValues) => {
  const { data } = await axiosInstance.patch(`/categories/${id}`, dto);
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/categories/${id}`);
};
