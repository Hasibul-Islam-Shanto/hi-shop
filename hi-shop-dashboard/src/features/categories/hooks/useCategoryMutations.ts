import { useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import type {
  CreateCategoryValues,
  UpdateCategoryValues,
} from "../schemas/category.schema";

const extractMessage = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "Something went wrong.";

const useCategoryMutations = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (dto: CreateCategoryValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await createCategory(dto);
      console.log("🚀 ~ create ~ data:", data);
      return { success: true, data };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (id: string, dto: UpdateCategoryValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await updateCategory(id, dto);
      return { success: true, data };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteCategory(id);
      return { success: true };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsDeleting(false);
    }
  };

  return { create, update, remove, isSubmitting, isDeleting, error };
};

export default useCategoryMutations;
