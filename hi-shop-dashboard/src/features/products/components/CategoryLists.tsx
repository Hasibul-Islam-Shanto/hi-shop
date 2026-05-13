import { useEffect, useRef, useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { ChevronDown, Search, Check, Loader2, AlertCircle, X } from "lucide-react";
import { fetchCategoriesFlat } from "@/features/categories/services/categoryService";
import type { CategoryItem } from "@/features/categories/schemas/category.schema";

const CategoryLists = () => {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name: "categoryId", control });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategoriesFlat()
      .then(setCategories)
      .catch(() => setLoadError("Failed to load categories."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const parentMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const topLevel = categories.filter((c) => !c.parentId);
  const childMap: Record<string, CategoryItem[]> = {};
  categories.forEach((c) => {
    if (c.parentId) {
      if (!childMap[c.parentId]) childMap[c.parentId] = [];
      childMap[c.parentId].push(c);
    }
  });

  const ordered: { item: CategoryItem; depth: number }[] = [];
  const buildOrdered = (items: CategoryItem[], depth: number) => {
    items.forEach((item) => {
      ordered.push({ item, depth });
      if (childMap[item.id]) buildOrdered(childMap[item.id], depth + 1);
    });
  };
  buildOrdered(topLevel, 0);

  categories.forEach((c) => {
    if (!ordered.find((o) => o.item.id === c.id)) {
      ordered.push({ item: c, depth: 0 });
    }
  });

  const filtered = search.trim()
    ? ordered.filter(({ item }) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase())
      )
    : ordered;

  const selected = categories.find((c) => c.id === value);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !isLoading && !loadError && setIsOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm ghost-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 ${
          error ? "border-destructive/50 ring-1 ring-destructive/20" : ""
        } ${isLoading || loadError ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-surface-container"}`}
      >
        <span className={selected ? "text-on-surface" : "text-on-surface-variant/40"}>
          {isLoading ? (
            <span className="flex items-center gap-2 text-on-surface-variant/60">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading categories…
            </span>
          ) : loadError ? (
            <span className="flex items-center gap-2 text-destructive/70">
              <AlertCircle className="h-3.5 w-3.5" />
              Failed to load
            </span>
          ) : selected ? (
            <span className="flex items-center gap-1.5">
              <span className="font-medium">{selected.name}</span>
              {selected.parentId && (
                <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full">
                  {parentMap[selected.parentId] ?? "Sub"}
                </span>
              )}
            </span>
          ) : (
            "Select a category…"
          )}
        </span>

        <span className="flex items-center gap-1 shrink-0 text-on-surface-variant">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="hover:text-destructive transition-colors p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-card rounded-xl ghost-border shadow-(--shadow-xl) overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2 ghost-border">
              <Search className="h-3.5 w-3.5 text-on-surface-variant shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto pb-2">
            {filtered.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">
                No categories found.
              </p>
            ) : (
              filtered.map(({ item, depth }) => {
                const isSelected = item.id === value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                    style={{ paddingLeft: `${12 + depth * 16}px` }}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {depth > 0 && (
                        <span className="text-outline shrink-0 text-[10px]">└</span>
                      )}
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono shrink-0 hidden sm:inline">
                        {item.slug}
                      </span>
                    </span>

                    <span className="flex items-center gap-2 shrink-0">
                      {item._count.products > 0 && (
                        <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full tabular-nums">
                          {item._count.products}p
                        </span>
                      )}
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-3 py-2 border-t border-outline-variant/10">
            <p className="text-[10px] text-on-surface-variant">
              {categories.length} categor{categories.length === 1 ? "y" : "ies"} available
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default CategoryLists;
