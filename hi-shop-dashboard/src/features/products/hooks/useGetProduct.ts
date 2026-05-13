import { useEffect, useState, useCallback } from "react";
import type { IProduct } from "../schemas/types";
import { getProduct } from "../services/productService";

const useGetProduct = (id: string | undefined) => {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProduct(id);
      setProduct(data);
    } catch {
      setError("Failed to load product.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, isLoading, error, reload: load };
};

export default useGetProduct;
