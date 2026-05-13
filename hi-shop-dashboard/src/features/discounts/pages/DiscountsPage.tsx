import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/shared/components/PageHeading";
import { Pagination } from "@/shared/components/Pagination";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  createDiscount,
  deactivateDiscount,
  getDiscounts,
  updateDiscount,
  type Discount,
  type DiscountValues,
} from "../services/discountService";
import type { PaginationMeta } from "@/features/orders/schemas/types";

const LIMIT = 20;

const statusColors: Record<string, string> = {
  Active: "text-tertiary bg-tertiary/10",
  Inactive: "text-on-surface-variant bg-surface-container",
};

const emptyForm: DiscountValues = {
  code: "",
  description: "",
  discountPct: undefined,
  discountAmt: undefined,
  minOrderAmt: undefined,
  maxUses: undefined,
  expiresAt: "",
  isActive: true,
};

const toInputDateTime = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
};

const cleanValues = (values: DiscountValues): DiscountValues => ({
  code: values.code.trim().toUpperCase(),
  ...(values.description?.trim() ? { description: values.description.trim() } : {}),
  ...(values.discountPct !== undefined ? { discountPct: Number(values.discountPct) } : {}),
  ...(values.discountAmt !== undefined ? { discountAmt: Number(values.discountAmt) } : {}),
  ...(values.minOrderAmt !== undefined ? { minOrderAmt: Number(values.minOrderAmt) } : {}),
  ...(values.maxUses !== undefined ? { maxUses: Number(values.maxUses) } : {}),
  ...(values.expiresAt ? { expiresAt: new Date(values.expiresAt).toISOString() } : {}),
  isActive: values.isActive,
});

const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | "Active" | "Inactive">("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [form, setForm] = useState<DiscountValues>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDiscounts({ page, limit: LIMIT, search, isActive: status });
      setDiscounts(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load discounts."));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (discount: Discount) => {
    setEditTarget(discount);
    setForm({
      code: discount.code,
      description: discount.description ?? "",
      discountPct: discount.discountPct ?? undefined,
      discountAmt: discount.discountAmt ?? undefined,
      minOrderAmt: discount.minOrderAmt ?? undefined,
      maxUses: discount.maxUses ?? undefined,
      expiresAt: toInputDateTime(discount.expiresAt),
      isActive: discount.isActive,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const saveDiscount = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = cleanValues(form);
      if (payload.discountPct !== undefined && payload.discountAmt !== undefined) {
        throw new Error("Use either percentage or amount, not both.");
      }
      const saved = editTarget
        ? await updateDiscount(editTarget.id, payload)
        : await createDiscount(payload);
      setDiscounts((prev) =>
        editTarget
          ? prev.map((discount) => (discount.id === saved.id ? saved : discount))
          : [saved, ...prev],
      );
      setIsModalOpen(false);
      setEditTarget(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save discount."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const deactivate = async (discount: Discount) => {
    setActionId(discount.id);
    setError(null);
    try {
      const updated = await deactivateDiscount(discount.id);
      setDiscounts((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to deactivate discount."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Manage" title="Discounts">
        <div className="hidden sm:flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border w-56">
          <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search codes..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "All" | "Active" | "Inactive");
            setPage(1);
          }}
          className="bg-surface-container text-sm text-on-surface rounded-lg px-3 py-1.5 ghost-border"
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <Button size="sm" className="gap-1.5" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" />
          Add Discount
        </Button>
      </PageHeading>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4 text-xs text-destructive">
          {error}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 w-full max-w-2xl ghost-border shadow-(--shadow-xl)">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-on-surface">
                {editTarget ? "Edit Discount" : "Add Discount"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-text text-[10px] mb-1 block">Code</label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="SAVE10"
                />
              </div>
              <div>
                <label className="label-text text-[10px] mb-1 block">Description</label>
                <Input
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Seasonal promo"
                />
              </div>
              <div>
                <label className="label-text text-[10px] mb-1 block">Percent</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.discountPct ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountPct: e.target.value === "" ? undefined : Number(e.target.value),
                      discountAmt: e.target.value === "" ? prev.discountAmt : undefined,
                    }))
                  }
                  placeholder="10"
                />
              </div>
              <div>
                <label className="label-text text-[10px] mb-1 block">Amount</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountAmt ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountAmt: e.target.value === "" ? undefined : Number(e.target.value),
                      discountPct: e.target.value === "" ? prev.discountPct : undefined,
                    }))
                  }
                  placeholder="100"
                />
              </div>
              <div>
                <label className="label-text text-[10px] mb-1 block">Min Order</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.minOrderAmt ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minOrderAmt: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="500"
                />
              </div>
              <div>
                <label className="label-text text-[10px] mb-1 block">Max Uses</label>
                <Input
                  type="number"
                  min={1}
                  value={form.maxUses ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxUses: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="100"
                />
              </div>
              <div>
                <label className="label-text text-[10px] mb-1 block">Expires At</label>
                <Input
                  type="datetime-local"
                  value={form.expiresAt ?? ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                  }
                />
              </div>
              <label className="flex items-end gap-2 text-sm text-on-surface-variant pb-2">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 accent-primary"
                />
                Active
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={isSubmitting} onClick={saveDiscount}>
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="label-text text-[10px] px-5 py-3">Code</th>
                <th className="label-text text-[10px] px-3 py-3">Value</th>
                <th className="label-text text-[10px] px-3 py-3">Usage</th>
                <th className="label-text text-[10px] px-3 py-3">Expires</th>
                <th className="label-text text-[10px] px-3 py-3">Status</th>
                <th className="label-text text-[10px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    Loading discounts…
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    No discounts found.
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-on-surface font-mono">{discount.code}</p>
                      <p className="text-xs text-on-surface-variant">{discount.description ?? "—"}</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-on-surface">
                      {discount.discountPct !== null
                        ? `${discount.discountPct}%`
                        : `$${Number(discount.discountAmt ?? 0).toFixed(2)}`}
                    </td>
                    <td className="px-3 py-3 text-sm text-on-surface-variant">
                      {discount.usedCount}/{discount.maxUses ?? "∞"}
                    </td>
                    <td className="px-3 py-3 text-sm text-on-surface-variant">
                      {discount.expiresAt
                        ? new Date(discount.expiresAt).toLocaleDateString("en-US")
                        : "Never"}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge
                        status={discount.isActive ? "Active" : "Inactive"}
                        colorMap={statusColors}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => openEdit(discount)}>
                          Edit
                        </Button>
                        {discount.isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={actionId === discount.id}
                            onClick={() => deactivate(discount)}
                          >
                            {actionId === discount.id && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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

export default DiscountsPage;
