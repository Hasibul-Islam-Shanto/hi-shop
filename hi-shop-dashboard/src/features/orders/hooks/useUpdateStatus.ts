import { useState } from "react";
import { updateOrderStatus } from "../services/orderServices";
import { OrderStatus } from "../schemas/types";
import { getApiErrorMessage } from "@/utils/api-error";

const useUpdateStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await updateOrderStatus(orderId, status, note);
      return { success: true, data: response };
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, "Failed to update order status.");
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsUpdating(false);
    }
  };
  return { updateStatus, isUpdating, error };
};

export default useUpdateStatus;
