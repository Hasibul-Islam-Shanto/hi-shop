import { useState, useEffect, useCallback } from "react";
import { fetchCategoriesFlat } from "../services/categoryService";
import type { CategoryItem } from "../schemas/category.schema";

const useCategories = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCategoriesFlat();
      setCategories(data);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, isLoading, error, reload: load };
};

export default useCategories;
