import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getPageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
};

export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) => {
  const from = Math.min((page - 1) * limit + 1, total);
  const to = Math.min(page * limit, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-outline-variant/10",
        className,
      )}
    >
      <p className="text-xs text-on-surface-variant order-2 sm:order-1">
        Showing{" "}
        <span className="font-medium text-on-surface">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-medium text-on-surface">{total}</span> results
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center justify-center h-7 w-7 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex items-center justify-center h-7 w-7 text-xs text-on-surface-variant"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-md text-xs font-medium transition-colors",
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              )}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center justify-center h-7 w-7 rounded-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
