import { useState } from "react";
import { deleteProduct } from "../services/productService";

const useDeleteProduct = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteProduct(id);
      return { success: true as const };
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to delete product.";
      setError(message);
      return { success: false as const, error: message };
    } finally {
      setIsDeleting(false);
    }
  };

  return { remove, isDeleting, error };
};

export default useDeleteProduct;
