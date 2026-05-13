import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProductFormValues } from "../schemas/product.schema";
import { Textarea } from "@/components/ui/textarea";

const ImageFields = () => {
  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const images = watch("images") ?? [];

  const handleAdd = () => {
    const isFirst = fields.length === 0;
    append({ url: "", altText: "", isPrimary: isFirst, sortOrder: undefined });
  };

  const setPrimary = (index: number) => {
    images.forEach((_, i) => {
      setValue(`images.${i}.isPrimary`, i === index, { shouldDirty: true });
    });
  };

  const handleRemove = (index: number) => {
    const wasPrimary = images[index]?.isPrimary;
    remove(index);
    if (wasPrimary && fields.length > 1) {
      const nextPrimaryIndex = index === 0 ? 0 : 0;
      setTimeout(() => {
        setValue(`images.${nextPrimaryIndex}.isPrimary`, true, {
          shouldDirty: true,
        });
      }, 0);
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 ghost-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="label-text text-primary text-[10px]">IMAGES</span>
          <h3 className="text-sm font-bold text-on-surface mt-0.5">
            Product Images
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="gap-1.5 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Image
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-on-surface-variant/50">
          <ImageIcon className="h-8 w-8" />
          <p className="text-xs text-center">
            No images yet. Images are optional.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-3 px-1">
            <span className="flex items-center gap-1.5 text-[10px] text-on-surface-variant">
              <span className="inline-flex h-3.5 w-3.5 rounded-full border-2 border-primary bg-primary/20 shrink-0" />
              Primary — shown as the main product image
            </span>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const isPrimary = images[index]?.isPrimary === true;

              return (
                <div
                  key={field.id}
                  className={`rounded-xl p-4 ghost-border transition-colors ${
                    isPrimary
                      ? "bg-primary/5 border-primary/30"
                      : "bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPrimary(index)}
                        disabled={isPrimary}
                        title={isPrimary ? "Primary image" : "Set as primary"}
                        className="shrink-0 focus:outline-none"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors ${
                            isPrimary
                              ? "border-primary bg-primary"
                              : "border-outline hover:border-primary"
                          }`}
                        >
                          {isPrimary && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-on-surface">
                          Image {index + 1}
                        </span>
                        {isPrimary ? (
                          <span className="text-[9px] font-bold uppercase tracking-wide bg-primary text-white px-1.5 py-0.5 rounded-full">
                            Primary
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wide text-on-surface-variant/50">
                            Secondary
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimary(index)}
                          className="text-[10px] text-on-surface-variant hover:text-primary transition-colors"
                        >
                          Set primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-on-surface-variant hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                        title="Remove image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="label-text text-[10px] mb-1 block">
                        URL <span className="text-destructive">*</span>
                      </label>
                      <Input
                        {...register(`images.${index}.url`)}
                        placeholder="https://example.com/image.jpg"
                      />
                      {errors.images?.[index]?.url && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.images[index].url?.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="label-text text-[10px] mb-1 block">
                          Alt Text
                        </label>
                        <Textarea
                          {...register(`images.${index}.altText`)}
                          placeholder="Describe the image"
                        />
                      </div>
                      <div>
                        <label className="label-text text-[10px] mb-1 block">
                          Sort Order
                        </label>
                        <Input
                          type="number"
                          min={0}
                          {...register(`images.${index}.sortOrder`)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageFields;
