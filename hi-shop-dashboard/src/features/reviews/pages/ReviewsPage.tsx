import { useCallback, useEffect, useState } from "react";
import { EyeOff, Loader2, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/PageHeading";
import { Pagination } from "@/shared/components/Pagination";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { getApiErrorMessage } from "@/utils/api-error";
import type { PaginationMeta } from "@/features/orders/schemas/types";
import type { IProduct } from "@/features/products/schemas/types";
import {
  getProductReviews,
  getReviewProducts,
  moderateReview,
  type ProductReview,
} from "../services/reviewService";

const LIMIT = 20;

const visibilityColors: Record<string, string> = {
  Visible: "text-tertiary bg-tertiary/10",
  Hidden: "text-on-surface-variant bg-surface-container",
};

const ReviewsPage = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [productId, setProductId] = useState("");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setIsLoadingProducts(true);
      setError(null);
      try {
        const data = await getReviewProducts();
        if (!isMounted) return;
        setProducts(data);
        setProductId(data[0]?.id ?? "");
      } catch (err) {
        if (isMounted) setError(getApiErrorMessage(err, "Failed to load products."));
      } finally {
        if (isMounted) setIsLoadingProducts(false);
      }
    };
    void loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadReviews = useCallback(async () => {
    if (!productId) {
      setReviews([]);
      setMeta(null);
      return;
    }
    setIsLoadingReviews(true);
    setError(null);
    try {
      const response = await getProductReviews(productId, page, LIMIT);
      setReviews(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load reviews."));
    } finally {
      setIsLoadingReviews(false);
    }
  }, [page, productId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const selectedProduct = products.find((product) => product.id === productId);
  const filteredReviews = reviews.filter((review) => {
    const customerName = `${review.user.firstName} ${review.user.lastName}`.toLowerCase();
    return (
      customerName.includes(search.toLowerCase()) ||
      (review.comment ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const hideReview = async (review: ProductReview) => {
    setActionId(review.id);
    setError(null);
    try {
      const updated = await moderateReview(review.id, false);
      setReviews((prev) =>
        prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to moderate review."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Moderate" title="Reviews">
        <div className="hidden sm:flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border w-56">
          <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
        <select
          value={productId}
          disabled={isLoadingProducts}
          onChange={(e) => {
            setProductId(e.target.value);
            setPage(1);
          }}
          className="bg-surface-container text-sm text-on-surface rounded-lg px-3 py-1.5 ghost-border max-w-[260px]"
        >
          {products.length === 0 ? (
            <option value="">No products</option>
          ) : (
            products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))
          )}
        </select>
      </PageHeading>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
        <div className="px-5 py-4 border-b border-outline-variant/10">
          <p className="text-sm font-semibold text-on-surface">
            {selectedProduct?.name ?? "Select a product"}
          </p>
          <p className="text-xs text-on-surface-variant">
            Backend currently exposes product-level visible reviews; hidden reviews disappear from this list after moderation.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="label-text text-[10px] px-5 py-3">Customer</th>
                <th className="label-text text-[10px] px-3 py-3">Rating</th>
                <th className="label-text text-[10px] px-3 py-3">Comment</th>
                <th className="label-text text-[10px] px-3 py-3">Status</th>
                <th className="label-text text-[10px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoadingReviews ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    Loading reviews…
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    No visible reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => {
                  const name = `${review.user.firstName} ${review.user.lastName}`;
                  return (
                    <tr key={review.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-on-surface">{name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {new Date(review.createdAt).toLocaleDateString("en-US")}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 text-sm font-semibold text-on-surface">
                          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                          {review.rating}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-on-surface-variant max-w-[360px]">
                        <span className="line-clamp-2">{review.comment ?? "—"}</span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge
                          status={review.isVisible ? "Visible" : "Hidden"}
                          colorMap={visibilityColors}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionId === review.id || !review.isVisible}
                            onClick={() => hideReview(review)}
                          >
                            {actionId === review.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                            Hide
                          </Button>
                        </div>
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

export default ReviewsPage;
