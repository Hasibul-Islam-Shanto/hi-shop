import { useState } from "react";
import { createProduct } from "../services/productService";
import type { ProductFormValues } from "../schemas/product.schema";

const useCreateProduct = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: ProductFormValues) => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await createProduct(data);
      return { success: true, data: result };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to create product.";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsCreating(false);
    }
  };

  return { create, isCreating, error };
};

export default useCreateProduct;
