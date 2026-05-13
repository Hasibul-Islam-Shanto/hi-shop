import { useState } from "react";
import { Search, ChevronDown, Eye } from "lucide-react";
import { PageHeading } from "@/shared/components/PageHeading";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { Pagination } from "@/shared/components/Pagination";
import OrderDetailModal, {
  orderStatusColors,
} from "@/features/orders/components/OrderDetailModal";
import type { Order, OrderStatus } from "@/features/orders/schemas/types";
import useGetOrders from "../hooks/useGetOrders";

const STATUS_OPTIONS: Array<"All" | OrderStatus> = [
  "All",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const LIMIT = 20;

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

const OrdersPage = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | OrderStatus>("All");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { orders, setOrders, meta, isLoading, error } = useGetOrders({
    page,
    limit: LIMIT,
    status: filterStatus,
  });

  const filtered = orders.filter((o) => {
    const customerName = `${o.user.firstName} ${o.user.lastName}`;
    return (
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleStatusFilterChange = (status: "All" | OrderStatus) => {
    setFilterStatus(status);
    setPage(1);
  };

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Manage" title="Orders">
        <div className="hidden sm:flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border w-52">
          <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) =>
              handleStatusFilterChange(e.target.value as "All" | OrderStatus)
            }
            className="appearance-none bg-surface-container text-sm text-on-surface rounded-lg px-3 py-1.5 pr-7 ghost-border focus:outline-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
        </div>
      </PageHeading>

      <div className="sm:hidden flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border mb-4">
        <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateStatus}
        />
      )}

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="label-text text-[10px] px-5 py-3">Customer</th>
                <th className="label-text text-[10px] px-3 py-3">Order ID</th>
                <th className="label-text text-[10px] px-3 py-3 hidden sm:table-cell">
                  Date
                </th>
                <th className="label-text text-[10px] px-3 py-3 hidden sm:table-cell">
                  Items
                </th>
                <th className="label-text text-[10px] px-3 py-3">Amount</th>
                <th className="label-text text-[10px] px-3 py-3">Status</th>
                <th className="label-text text-[10px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-on-surface-variant"
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-destructive"
                  >
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-on-surface-variant"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const customerName = `${order.user.firstName} ${order.user.lastName}`;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {order.user.firstName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">
                              {customerName}
                            </p>
                            <p className="text-xs text-on-surface-variant truncate">
                              {order.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-on-surface-variant font-mono whitespace-nowrap">
                        {order.id.slice(0, 8)}…
                      </td>
                      <td className="px-3 py-3 text-sm text-on-surface-variant whitespace-nowrap hidden sm:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-3 py-3 text-sm text-on-surface hidden sm:table-cell">
                        {order.items.length}
                      </td>
                      <td className="px-3 py-3 text-sm font-semibold text-on-surface whitespace-nowrap">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          status={order.status}
                          colorMap={orderStatusColors}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-on-surface-variant hover:text-primary transition-colors p-1"
                          aria-label="View order"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
