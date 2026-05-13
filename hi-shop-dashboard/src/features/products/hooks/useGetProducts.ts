import { useState, useEffect, useCallback } from "react";
import type { IProduct, PaginationMeta } from "../schemas/types";
import { getProducts } from "../services/productService";

const useGetProducts = (page = 1, limit = 20) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getProducts(page, limit);
      setProducts(response.data);
      setMeta(response.meta);
    } catch {
      setError("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { products, meta, isLoading, error, reload: load };
};

export default useGetProducts;
