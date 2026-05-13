import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "../schemas/product.schema";

const defaultVariant = {
  sku: "",
  size: "",
  color: "",
  stock: 0,
  priceModifier: "",
  isActive: true,
};

const VariantFields = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  return (
    <div className="bg-card rounded-2xl p-5 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="label-text text-primary text-[10px]">
            VARIANTS
          </span>
          <h3 className="text-sm font-bold text-on-surface mt-0.5">
            Product Variants
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(defaultVariant as never)}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Variant
        </Button>
      </div>

      {errors.variants?.root && (
        <p className="text-xs text-destructive mb-3">
          {errors.variants.root.message}
        </p>
      )}
      {typeof errors.variants?.message === "string" && (
        <p className="text-xs text-destructive mb-3">
          {errors.variants.message}
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="bg-surface-container-low rounded-xl p-4 ghost-border relative"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-on-surface-variant">
                Variant {index + 1}
              </span>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-on-surface-variant hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label-text text-[10px] mb-1 block">
                  SKU <span className="text-destructive">*</span>
                </label>
                <Input
                  {...register(`variants.${index}.sku`)}
                  placeholder="e.g. PROD-SM-BLK"
                />
                {errors.variants?.[index]?.sku && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.variants[index].sku?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-text text-[10px] mb-1 block">
                  Size
                </label>
                <Input
                  {...register(`variants.${index}.size`)}
                  placeholder="e.g. S, M, L"
                />
              </div>

              <div>
                <label className="label-text text-[10px] mb-1 block">
                  Color
                </label>
                <Input
                  {...register(`variants.${index}.color`)}
                  placeholder="e.g. Black"
                />
              </div>

              <div>
                <label className="label-text text-[10px] mb-1 block">
                  Stock <span className="text-destructive">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  {...register(`variants.${index}.stock`)}
                  placeholder="0"
                />
                {errors.variants?.[index]?.stock && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.variants[index].stock?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="label-text text-[10px] mb-1 block">
                  Price Modifier ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register(`variants.${index}.priceModifier`)}
                  placeholder="0.00"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`variants.${index}.isActive`}
                  {...register(`variants.${index}.isActive`)}
                  className="h-4 w-4 rounded accent-primary"
                />
                <label
                  htmlFor={`variants.${index}.isActive`}
                  className="text-xs text-on-surface-variant cursor-pointer"
                >
                  Active
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariantFields;
