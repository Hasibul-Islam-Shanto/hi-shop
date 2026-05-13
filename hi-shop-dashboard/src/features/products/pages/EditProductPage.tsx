import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateProductSchema,
  type UpdateProductValues,
} from "../schemas/product.schema";
import EditVariantFields from "../components/EditVariantFields";
import EditImageFields from "../components/EditImageFields";
import CategoryLists from "../components/CategoryLists";
import useGetProduct from "../hooks/useGetProduct";
import useUpdateProduct from "../hooks/useUpdateProduct";
import { toast } from "sonner";
import { parseDecimal } from "@/utils/helper";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    product,
    isLoading: isFetching,
    error: fetchError,
    reload,
  } = useGetProduct(id);
  console.log("🚀 ~ EditProductPage ~ product:", product);
  const { update, isUpdating, error: updateError } = useUpdateProduct();

  const methods = useForm<UpdateProductValues>({
    resolver: zodResolver(updateProductSchema) as Resolver<UpdateProductValues>,
    defaultValues: {
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      isActive: true,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (!product) return;
    reset({
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      basePrice: parseDecimal(product.basePrice),
      isActive: product.isActive,
    });
  }, [product, reset]);

  const nameValue = watch("name");

  const handleNameBlur = () => {
    const currentSlug = watch("slug");
    if (!currentSlug && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  };

  const onSubmit = async (data: UpdateProductValues) => {
    if (!id) return;
    const result = await update(id, data);
    if (result.success) {
      toast.success("Product updated successfully", {
        description: "The product has been updated successfully.",
        duration: 2000,
        position: "top-center",
      });
      reload();
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <Package className="h-7 w-7 text-destructive/60" />
          </div>
          <div>
            <p className="text-sm font-semibold text-on-surface mb-1">
              Product not found
            </p>
            <p className="text-xs text-on-surface-variant">
              {fetchError ?? "The product you're looking for doesn't exist."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/inventory")}
          >
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-outline-variant/10 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/admin/inventory")}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <span className="label-text text-primary text-[10px]">
                  INVENTORY
                </span>
                <h1 className="text-base font-bold text-on-surface truncate max-w-[220px]">
                  {product.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/inventory")}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isUpdating}
                className="gap-1.5 min-w-[130px]"
                onClick={handleSubmit(onSubmit)}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Details"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {updateError && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive font-medium">
                {updateError}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-card rounded-2xl p-5 ghost-border">
                <span className="label-text text-primary text-[10px]">
                  DETAILS
                </span>
                <h3 className="text-sm font-bold text-on-surface mt-0.5 mb-4">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="label-text text-[10px] mb-1 block">
                      Product Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      {...register("name")}
                      onBlur={handleNameBlur}
                      placeholder="e.g. Classic Merino Pullover"
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label-text text-[10px] mb-1 block">
                      Slug
                      <span className="text-on-surface-variant ml-1 text-[9px]">
                        (auto-generated, editable)
                      </span>
                    </label>
                    <Input
                      {...register("slug")}
                      placeholder="classic-merino-pullover"
                    />
                    {errors.slug && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.slug.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label-text text-[10px] mb-1 block">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      placeholder="Describe the product (max 2000 characters)…"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none ghost-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 resize-none"
                    />
                    {errors.description && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="w-full max-w-[200px]">
                    <label className="label-text text-[10px] mb-1 block">
                      Base Price ($) <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...register("basePrice")}
                      placeholder="0.00"
                    />
                    {errors.basePrice && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.basePrice.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <EditVariantFields
                productId={product.id}
                variants={product.variants}
                onRefresh={reload}
              />
            </div>

            <div className="space-y-5">
              <div className="bg-card rounded-2xl p-5 ghost-border">
                <span className="label-text text-primary text-[10px]">
                  ORGANIZATION
                </span>
                <h3 className="text-sm font-bold text-on-surface mt-0.5 mb-4">
                  Categorization
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="label-text text-[10px] mb-1 block">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <CategoryLists />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register("isActive")}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-on-surface-variant cursor-pointer"
                    >
                      Active (visible to customers)
                    </label>
                  </div>
                </div>
              </div>

              <EditImageFields
                productId={product.id}
                images={product.images}
                onRefresh={reload}
              />
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default EditProductPage;
