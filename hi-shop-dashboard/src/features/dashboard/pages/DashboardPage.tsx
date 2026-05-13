import { Link } from "react-router-dom";
import {
  BarChart3, ShoppingCart, TrendingUp, ArrowUpRight,
  MoreHorizontal, Calendar, Download, Filter, Search,
  Plus, ChevronLeft, ChevronRight, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/PageHeading";
import { StatusBadge } from "@/shared/components/StatusBadge";
import useStats from "../hooks/useStats";

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

const SkeletonCard = () => (
  <div className="bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm) animate-pulse">
    <div className="h-10 w-10 rounded-lg bg-surface-container-high mb-3" />
    <div className="h-3 w-24 bg-surface-container-high rounded mb-2" />
    <div className="h-7 w-32 bg-surface-container-high rounded" />
  </div>
);

const DashboardPage = () => {
  const { stats, isLoading } = useStats();

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Overview" title="Dashboard">
        <Button variant="outline" size="sm">
          <Calendar className="h-3.5 w-3.5 mr-1.5" /> Today
        </Button>
        <Button variant="hero" size="sm">
          <Download className="h-3.5 w-3.5 mr-1.5" /> Export
        </Button>
      </PageHeading>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <div className="bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-tertiary">
                  <TrendingUp className="h-3 w-3" />
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-0.5">Total Revenue</p>
              <p className="text-2xl font-extrabold text-on-surface">
                ${parseFloat(stats?.totalRevenue ?? "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-secondary" />
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-0.5">Total Orders</p>
              <p className="text-2xl font-extrabold text-on-surface">
                {stats?.totalOrders?.toLocaleString() ?? "0"}
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-tertiary" />
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-0.5">Total Customers</p>
              <p className="text-2xl font-extrabold text-on-surface">
                {stats?.totalCustomers?.toLocaleString() ?? "0"}
              </p>
            </div>

            <div className="bg-card rounded-xl p-5 ghost-border shadow-(--shadow-sm) hover:shadow-(--shadow-md) hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-xs text-on-surface-variant mb-0.5">Total Products</p>
              <p className="text-2xl font-extrabold text-on-surface">
                {stats?.totalProducts?.toLocaleString() ?? "0"}
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Recent Orders</h2>
            <p className="text-xs text-on-surface-variant">Last 5 transactions</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-left border-b border-outline-variant/10">
                  <th className="label-text text-[10px] px-5 py-3">Customer</th>
                  <th className="label-text text-[10px] px-3 py-3">Order ID</th>
                  <th className="label-text text-[10px] px-3 py-3 hidden sm:table-cell">Date</th>
                  <th className="label-text text-[10px] px-3 py-3">Amount</th>
                  <th className="label-text text-[10px] px-3 py-3">Status</th>
                  <th className="label-text text-[10px] px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                      Loading…
                    </td>
                  </tr>
                ) : !stats?.recentOrders?.length ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
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
                      <td className="px-3 py-3">
                        <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant">
              {stats?.recentOrders?.length ?? 0} of {stats?.totalOrders ?? 0} orders
            </p>
            <div className="flex items-center gap-1">
              <button className="h-7 w-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="h-7 w-7 rounded-lg flex items-center justify-center text-xs font-medium transition-colors bg-primary text-primary-foreground">
                1
              </button>
              <button className="h-7 w-7 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-6 ghost-border shadow-(--shadow-sm)">
          <h3 className="text-sm font-bold text-on-surface mb-4">Orders by Status</h3>
          {isLoading ? (
            <div className="space-y-2.5 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-container-high rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(stats?.ordersByStatus ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="label-text text-[10px]">{status}</span>
                  <span className="text-xs font-semibold text-on-surface">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 ghost-border shadow-(--shadow-sm)">
          <h3 className="text-lg font-extrabold text-on-surface mb-4">System Health</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-tertiary shrink-0" />
              <span className="label-text text-[10px]">Main Node: Online</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-tertiary shrink-0" />
              <span className="label-text text-[10px]">Edge: 12ms</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
              <span className="label-text text-[10px]">API Gateway: 99.9% Uptime</span>
            </div>
          </div>
          <Link
            to="/admin/analytics"
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline w-fit mt-4"
          >
            View Analytics <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <button className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-[0_4px_14px_hsl(var(--primary)/0.3)] hover:scale-105 hover:shadow-[0_6px_20px_hsl(var(--primary)/0.4)] transition-all duration-200 z-10">
        <Plus className="h-5 w-5 text-primary-foreground" />
      </button>
    </div>
  );
};

export default DashboardPage;
