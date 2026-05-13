import { useState } from "react";
import {
  addVariant,
  updateVariant,
  deleteVariant,
} from "../services/productService";
import type {
  VariantFormValues,
  UpdateVariantValues,
} from "../schemas/product.schema";

const extractMessage = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "Something went wrong.";

const useVariantMutations = (productId: string) => {
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const add = async (data: VariantFormValues) => {
    setIsAdding(true);
    setError(null);
    try {
      const result = await addVariant(productId, data);
      return { success: true, data: result };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsAdding(false);
    }
  };

  const update = async (variantId: string, data: UpdateVariantValues) => {
    setUpdatingId(variantId);
    setError(null);
    try {
      const result = await updateVariant(productId, variantId, data);
      return { success: true, data: result };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setUpdatingId(null);
    }
  };

  const remove = async (variantId: string) => {
    setDeletingId(variantId);
    setError(null);
    try {
      await deleteVariant(productId, variantId);
      return { success: true };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setDeletingId(null);
    }
  };

  return { add, update, remove, isAdding, updatingId, deletingId, error };
};

export default useVariantMutations;
