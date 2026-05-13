import { useNavigate } from "react-router-dom";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  productSchema,
  type ProductFormValues,
} from "../schemas/product.schema";
import VariantFields from "../components/VariantFields";
import ImageFields from "../components/ImageFields";
import CategoryLists from "../components/CategoryLists";
import useCreateProduct from "../hooks/useCreateProduct";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const AddProductPage = () => {
  const navigate = useNavigate();
  const { create, isCreating, error } = useCreateProduct();

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      categoryId: "",
      name: "",
      slug: "",
      description: "",
      basePrice: 0,
      isActive: true,
      variants: [
        {
          sku: "",
          size: "",
          color: "",
          stock: 0,
          priceModifier: undefined,
          isActive: true,
        },
      ],
      images: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const nameValue = watch("name");

  const handleNameBlur = () => {
    const currentSlug = watch("slug");
    if (!currentSlug && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    const result = await create(data);
    if (result.success) {
      navigate("/admin/inventory");
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-background"
      >
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
                <h1 className="text-base font-bold text-on-surface">
                  Add New Product
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
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="gap-1.5 min-w-[110px]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {error && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-destructive font-medium">{error}</p>
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

              <VariantFields />
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

              <ImageFields />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddProductPage;
