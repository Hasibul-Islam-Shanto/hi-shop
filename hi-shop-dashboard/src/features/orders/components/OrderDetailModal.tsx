import { useEffect, useState } from "react";
import { X, Loader2, Truck, History, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/shared/components/StatusBadge";
import type { Order, OrderStatus, OrderStatusLog, UpdateShippingValues } from "../schemas/types";
import useUpdateStatus from "../hooks/useUpdateStatus";
import { getOrderStatusLogs, updateOrderShipping } from "../services/orderServices";
import { getApiErrorMessage } from "@/utils/api-error";

export type { Order, OrderStatus };

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export const orderStatusColors: Record<OrderStatus, string> = {
  PENDING: "text-on-surface-variant bg-surface-container",
  CONFIRMED: "text-primary bg-primary/10",
  PROCESSING: "text-secondary bg-secondary/10",
  SHIPPED: "text-tertiary bg-tertiary/10",
  DELIVERED: "text-green-600 bg-green-500/10",
  CANCELLED: "text-destructive bg-destructive/10",
  REFUNDED: "text-orange-600 bg-orange-500/10",
};

const formatDate = (value: string | null | undefined): string => {
  if (!value || typeof value !== "string") return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const formatMoney = (value: number | string | null | undefined): string => {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
};

const toDateTimeInput = (value: string | null | undefined): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
};

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderDetailModal = ({
  order,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) => {
  const { updateStatus, isUpdating } = useUpdateStatus();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [logs, setLogs] = useState<OrderStatusLog[]>([]);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingValues, setShippingValues] = useState<UpdateShippingValues>({
    shippingMethod: order.shippingMethod ?? "STANDARD",
    courierName: order.courierName ?? "",
    trackingNumber: order.trackingNumber ?? "",
    shippedAt: toDateTimeInput(order.shippedAt),
    deliveredAt: toDateTimeInput(order.deliveredAt),
  });

  const customerName = `${order.user.firstName} ${order.user.lastName}`;

  useEffect(() => {
    let isMounted = true;
    const loadLogs = async () => {
      setLogsError(null);
      try {
        const data = await getOrderStatusLogs(order.id);
        if (isMounted) setLogs(data);
      } catch (err) {
        if (isMounted) {
          setLogsError(getApiErrorMessage(err, "Failed to load status logs."));
        }
      }
    };
    void loadLogs();
    return () => {
      isMounted = false;
    };
  }, [order.id]);

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (status === order.status || isUpdating) return;
    setUpdateError(null);
    setPendingStatus(status);
    const result = await updateStatus(order.id, status, statusNote);
    setPendingStatus(null);
    if (result.success) {
      onUpdateStatus(order.id, status);
      setStatusNote("");
      setLogs((prev) => [
        {
          id: `${order.id}-${status}-${Date.now()}`,
          orderId: order.id,
          status,
          note: statusNote.trim() || null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else {
      setUpdateError(result.error ?? "Failed to update status.");
    }
  };

  const handleShippingChange = (key: keyof UpdateShippingValues, value: string) => {
    setShippingValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveShipping = async () => {
    setShippingError(null);
    setIsSavingShipping(true);
    try {
      const payload: UpdateShippingValues = {
        shippingMethod: shippingValues.shippingMethod?.trim() || undefined,
        courierName: shippingValues.courierName?.trim() || undefined,
        trackingNumber: shippingValues.trackingNumber?.trim() || undefined,
        shippedAt: shippingValues.shippedAt
          ? new Date(shippingValues.shippedAt).toISOString()
          : undefined,
        deliveredAt: shippingValues.deliveredAt
          ? new Date(shippingValues.deliveredAt).toISOString()
          : undefined,
      };
      const updated = await updateOrderShipping(order.id, payload);
      onUpdateStatus(order.id, updated.status);
    } catch (err) {
      setShippingError(getApiErrorMessage(err, "Failed to update shipping."));
    } finally {
      setIsSavingShipping(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-2xl p-5 w-full max-w-3xl ghost-border shadow-(--shadow-xl) animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-on-surface">
              Order{" "}
              <span className="font-mono text-sm">{order.id.slice(0, 8)}…</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-5 p-4 bg-surface-container-low rounded-xl">
          <div>
            <p className="label-text text-[10px] mb-0.5">Customer</p>
            <p className="text-sm font-semibold text-on-surface">
              {customerName}
            </p>
          </div>
          <div>
            <p className="label-text text-[10px] mb-0.5">Email</p>
            <p className="text-sm text-on-surface-variant truncate">
              {order.user.email}
            </p>
          </div>
          <div>
            <p className="label-text text-[10px] mb-0.5">Amount</p>
            <p className="text-sm font-semibold text-on-surface">
              ${formatMoney(order.totalAmount)}
            </p>
          </div>
          <div>
            <p className="label-text text-[10px] mb-0.5">Items</p>
            <p className="text-sm text-on-surface">{order.items.length}</p>
          </div>
          <div>
            <p className="label-text text-[10px] mb-0.5">Status</p>
            <StatusBadge status={order.status} colorMap={orderStatusColors} />
          </div>
          {order.notes && (
            <div className="col-span-2">
              <p className="label-text text-[10px] mb-0.5">Notes</p>
              <p className="text-sm text-on-surface-variant">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="mb-5 p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-primary" />
            <p className="label-text text-[10px]">Shipping</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label-text text-[10px] mb-1 block">Method</label>
              <Input
                value={shippingValues.shippingMethod ?? ""}
                onChange={(e) => handleShippingChange("shippingMethod", e.target.value)}
                placeholder="STANDARD"
              />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Courier</label>
              <Input
                value={shippingValues.courierName ?? ""}
                onChange={(e) => handleShippingChange("courierName", e.target.value)}
                placeholder="Pathao Courier"
              />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Tracking</label>
              <Input
                value={shippingValues.trackingNumber ?? ""}
                onChange={(e) => handleShippingChange("trackingNumber", e.target.value)}
                placeholder="TRK-123456"
              />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Shipped At</label>
              <Input
                type="datetime-local"
                value={shippingValues.shippedAt ?? ""}
                onChange={(e) => handleShippingChange("shippedAt", e.target.value)}
              />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Delivered At</label>
              <Input
                type="datetime-local"
                value={shippingValues.deliveredAt ?? ""}
                onChange={(e) => handleShippingChange("deliveredAt", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                className="w-full gap-1.5"
                disabled={isSavingShipping}
                onClick={handleSaveShipping}
              >
                {isSavingShipping ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save Shipping
              </Button>
            </div>
          </div>
          {shippingError && (
            <p className="mt-3 text-xs text-destructive">{shippingError}</p>
          )}
        </div>

        {order.items.length > 0 && (
          <div className="mb-5">
            <p className="label-text text-[10px] mb-2">Order Items</p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {item.productVariant.sku}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {item.productVariant.color} · {item.productVariant.size} ·
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-on-surface shrink-0 ml-4">
                    ${formatMoney(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="label-text text-[10px] mb-2">Update Status</p>
        <textarea
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Optional status note"
          className="w-full mb-3 bg-surface-container-low rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none ghost-border focus:ring-2 focus:ring-primary/20 resize-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((s) => {
            const isActive = order.status === s;
            const isThisUpdating = pendingStatus === s;
            return (
              <Button
                key={s}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdateStatus(s)}
                disabled={isUpdating || isActive}
                className="text-xs min-w-[90px]"
              >
                {isThisUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  s.charAt(0) + s.slice(1).toLowerCase()
                )}
              </Button>
            );
          })}
        </div>

        {updateError && (
          <p className="mt-3 text-xs text-destructive">{updateError}</p>
        )}

        <div className="mt-5 pt-5 border-t border-outline-variant/10">
          <div className="flex items-center gap-2 mb-3">
            <History className="h-4 w-4 text-primary" />
            <p className="label-text text-[10px]">Status Logs</p>
          </div>
          {logsError ? (
            <p className="text-xs text-destructive">{logsError}</p>
          ) : logs.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No status logs yet.</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-surface-container-low px-3 py-2"
                >
                  <div>
                    <StatusBadge status={log.status} colorMap={orderStatusColors} />
                    {log.note && (
                      <p className="text-xs text-on-surface-variant mt-1">{log.note}</p>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
