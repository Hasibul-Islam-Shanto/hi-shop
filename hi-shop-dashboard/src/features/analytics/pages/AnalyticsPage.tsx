import {
  TrendingUp, DollarSign, ShoppingCart, Users, Package,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { PageHeading } from "@/shared/components/PageHeading";
import { StatusBadge } from "@/shared/components/StatusBadge";
import useStats from "@/features/dashboard/hooks/useStats";

const orderStatusColors: Record<string, string> = {
  PENDING: "text-on-surface-variant bg-surface-container",
  CONFIRMED: "text-primary bg-primary/10",
  PROCESSING: "text-primary bg-primary/10",
  SHIPPED: "text-secondary bg-secondary/10",
  DELIVERED: "text-tertiary bg-tertiary/10",
  CANCELLED: "text-destructive bg-destructive/10",
  REFUNDED: "text-destructive bg-destructive/10",
};

const formatDate = (value: string | null | undefined): string => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const AnalyticsPage = () => {
  const { stats, isLoading } = useStats();

  const kpis = [
    {
      label: "Total Revenue",
      value: isLoading ? "—" : `$${parseFloat(stats?.totalRevenue ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Orders",
      value: isLoading ? "—" : (stats?.totalOrders?.toLocaleString() ?? "0"),
      icon: ShoppingCart,
      color: "text-secondary bg-secondary/10",
    },
    {
      label: "Total Customers",
      value: isLoading ? "—" : (stats?.totalCustomers?.toLocaleString() ?? "0"),
      icon: Users,
      color: "text-tertiary bg-tertiary/10",
    },
    {
      label: "Total Products",
      value: isLoading ? "—" : (stats?.totalProducts?.toLocaleString() ?? "0"),
      icon: Package,
      color: "text-primary bg-primary/10",
    },
  ];

  const chartData = stats
    ? Object.entries(stats.ordersByStatus).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Insights" title="Analytics" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {kpis.map((m) => (
          <div
            key={m.label}
            className="bg-card rounded-xl p-4 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
              {!isLoading && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-tertiary">
                  <TrendingUp className="h-3 w-3" />
                </span>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant mb-0.5">{m.label}</p>
            <p className={`text-xl font-extrabold text-on-surface ${isLoading ? "animate-pulse" : ""}`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm)">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-on-surface">Orders by Status</h3>
          </div>
          {isLoading ? (
            <div className="h-44 flex items-center justify-center animate-pulse">
              <div className="h-full w-full bg-surface-container rounded-lg" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={176}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 10, fill: "hsl(var(--on-surface-variant))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--on-surface-variant))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--outline-variant)/0.2)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--primary)/${entry.count > 0 ? "1" : "0.3"})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm)">
          <h3 className="text-sm font-bold text-on-surface mb-4">Status Breakdown</h3>
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-container-high rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {chartData.map(({ status, count }) => (
                <div key={status} className="flex items-center justify-between">
                  <StatusBadge status={status} colorMap={orderStatusColors} />
                  <span className="text-xs font-bold text-on-surface">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <h3 className="text-sm font-bold text-on-surface">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="label-text text-[10px] px-5 py-3">Customer</th>
                <th className="label-text text-[10px] px-3 py-3">Order ID</th>
                <th className="label-text text-[10px] px-3 py-3 hidden sm:table-cell">Date</th>
                <th className="label-text text-[10px] px-3 py-3">Amount</th>
                <th className="label-text text-[10px] px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    Loading…
                  </td>
                </tr>
              ) : !stats?.recentOrders?.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {order.customerName.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-on-surface truncate">{order.customerName}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-on-surface-variant font-mono whitespace-nowrap">
                      {order.id.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-3 text-sm text-on-surface-variant whitespace-nowrap hidden sm:table-cell">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-on-surface whitespace-nowrap">
                      ${parseFloat(String(order.total)).toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={order.status} colorMap={orderStatusColors} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
