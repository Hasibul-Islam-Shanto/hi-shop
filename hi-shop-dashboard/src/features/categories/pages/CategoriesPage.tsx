import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/PageHeading";
import CategoryModal from "../components/CategoryModal";
import useCategories from "../hooks/useCategories";
import useCategoryMutations from "../hooks/useCategoryMutations";
import type {
  CategoryItem,
  CreateCategoryValues,
} from "../schemas/category.schema";

const CategoriesPage = () => {
  const { categories, isLoading, error: loadError, reload } = useCategories();
  const {
    create,
    update,
    remove,
    isSubmitting,
    isDeleting,
    error: mutateError,
  } = useCategoryMutations();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const parentMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const openAdd = () => {
    setEditTarget(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditTarget(cat);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateCategoryValues, id?: string) => {
    setActionError(null);
    const result = id ? await update(id, data) : await create(data);

    if (result.success) {
      setIsModalOpen(false);
      setEditTarget(null);
      reload();
    } else {
      setActionError(result.error ?? mutateError ?? "Failed to save.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError(null);
    const result = await remove(deleteTarget.id);
    if (result.success) {
      setDeleteTarget(null);
      reload();
    } else {
      setActionError(result.error ?? mutateError ?? "Failed to delete.");
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Manage" title="Categories">
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
        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Category
        </Button>
      </PageHeading>

      <div className="sm:hidden flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border mb-4">
        <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      {actionError && (
        <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive font-medium">{actionError}</p>
        </div>
      )}

      {isModalOpen && (
        <CategoryModal
          isEditing={!!editTarget}
          editTarget={editTarget}
          categories={categories}
          isSubmitting={isSubmitting}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl p-5 w-full max-w-sm ghost-border shadow-(--shadow-xl) animate-in fade-in-0 zoom-in-95 duration-200">
            <h2 className="text-base font-bold text-on-surface mb-2">
              Delete Category?
            </h2>
            <p className="text-sm text-on-surface-variant mb-1">
              You are about to delete{" "}
              <span className="font-semibold text-on-surface">
                {deleteTarget.name}
              </span>
              .
            </p>
            <p className="text-xs text-on-surface-variant mb-5">
              This will fail if the category has active products or
              subcategories.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setDeleteTarget(null);
                  setActionError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="flex-1 gap-1.5"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-[var(--shadow-sm)]">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading categories…</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm text-destructive">{loadError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={reload}
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="text-left border-b border-outline-variant/10">
                    <th className="label-text text-[10px] px-5 py-3">Name</th>
                    <th className="label-text text-[10px] px-3 py-3 hidden sm:table-cell">
                      Slug
                    </th>
                    <th className="label-text text-[10px] px-3 py-3 hidden md:table-cell">
                      Description
                    </th>
                    <th className="label-text text-[10px] px-3 py-3 hidden lg:table-cell">
                      Parent
                    </th>
                    <th className="label-text text-[10px] px-3 py-3">
                      Products
                    </th>
                    <th className="label-text text-[10px] px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-sm text-on-surface-variant"
                      >
                        {search
                          ? "No categories match your search."
                          : "No categories yet. Add one above."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((cat) => (
                      <tr
                        key={cat.id}
                        className="hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-semibold text-on-surface">
                            {cat.name}
                          </p>
                          <p className="text-xs text-on-surface-variant font-mono sm:hidden">
                            {cat.slug}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-xs text-on-surface-variant font-mono hidden sm:table-cell">
                          {cat.slug}
                        </td>
                        <td className="px-3 py-3 text-sm text-on-surface-variant hidden md:table-cell max-w-[200px]">
                          <span className="line-clamp-1">
                            {cat.description ?? (
                              <span className="opacity-30 italic">—</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-on-surface-variant hidden lg:table-cell">
                          {cat.parentId ? (
                            <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full">
                              {parentMap[cat.parentId] ?? "Unknown"}
                            </span>
                          ) : (
                            <span className="text-xs text-on-surface-variant/40 italic">
                              Top-level
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs font-semibold tabular-nums ${
                              cat._count.products > 0
                                ? "text-tertiary"
                                : "text-on-surface-variant/50"
                            }`}
                          >
                            {cat._count.products}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(cat)}
                              className="text-on-surface-variant hover:text-primary transition-colors p-1"
                              aria-label="Edit category"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteTarget(cat);
                                setActionError(null);
                              }}
                              className="text-on-surface-variant hover:text-destructive transition-colors p-1"
                              aria-label="Delete category"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant">
                {filtered.length} of {categories.length} categories
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
