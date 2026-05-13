import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getStats, type StatsResponse } from "../services/statsService";

const useStats = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getStats();
        setStats(data);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ?? "Failed to load statistics.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { stats, isLoading, error };
};

export default useStats;
