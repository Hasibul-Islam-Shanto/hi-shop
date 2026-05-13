import { useState } from "react";
import { addImage, deleteImage } from "../services/productService";
import type { ImageFormValues } from "../schemas/product.schema";

const extractMessage = (err: unknown): string =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? "Something went wrong.";

const useImageMutations = (productId: string) => {
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const add = async (data: ImageFormValues) => {
    setIsAdding(true);
    setError(null);
    try {
      const result = await addImage(productId, data);
      return { success: true, data: result };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsAdding(false);
    }
  };

  const remove = async (imageId: string) => {
    setDeletingId(imageId);
    setError(null);
    try {
      await deleteImage(productId, imageId);
      return { success: true };
    } catch (err) {
      const msg = extractMessage(err);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setDeletingId(null);
    }
  };

  return { add, remove, isAdding, deletingId, error };
};

export default useImageMutations;
