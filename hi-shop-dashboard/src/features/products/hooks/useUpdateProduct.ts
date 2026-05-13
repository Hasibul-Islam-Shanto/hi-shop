import { useState } from "react";
import { updateProduct } from "../services/productService";
import type { UpdateProductValues } from "../schemas/product.schema";

const useUpdateProduct = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: UpdateProductValues) => {
    setIsUpdating(true);
    setError(null);
    try {
      const result = await updateProduct(id, data);
      return { success: true, data: result };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to update product.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { update, isUpdating, error };
};

export default useUpdateProduct;
