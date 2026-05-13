import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Trash2,
  Loader2,
  Star,
  ImageIcon,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { imageSchema, type ImageFormValues } from "../schemas/product.schema";
import type { ProductImage } from "../schemas/types";
import useImageMutations from "../hooks/useImageMutations";
import { toast } from "sonner";

interface EditImageFieldsProps {
  productId: string;
  images: ProductImage[];
  onRefresh: () => void;
}

const AddImageForm = ({
  onAdd,
  isAdding,
  existingCount,
}: {
  onAdd: (
    data: ImageFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
  isAdding: boolean;
  existingCount: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ImageFormValues>({
    resolver: zodResolver(imageSchema) as Resolver<ImageFormValues>,
    defaultValues: {
      url: "",
      altText: "",
      isPrimary: existingCount === 0,
      sortOrder: existingCount,
    },
  });

  const onSubmit = async (data: ImageFormValues) => {
    setFormError(null);
    const result = await onAdd(data);
    if (result.success) {
      reset();
      setIsOpen(false);
      toast.success("Image added successfully", {
        description: "The image has been added successfully.",
        duration: 2000,
        position: "top-center",
      });
    } else {
      setFormError(result.error ?? "Failed to add image.");
      toast.error("Failed to add image.", {
        description: "The image has not been added.",
        duration: 2000,
        position: "top-center",
      });
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-on-surface-variant hover:text-primary border-2 border-dashed border-outline-variant/20 hover:border-primary/30 rounded-xl transition-all duration-200"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Image
      </button>
    );
  }

  return (
    <div className="bg-tertiary/5 rounded-xl p-4 border-2 border-dashed border-tertiary/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-tertiary">New Image</span>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setFormError(null);
            reset();
          }}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {formError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{formError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="label-text text-[10px] mb-1 block">
            URL <span className="text-destructive">*</span>
          </label>
          <Input
            {...register("url")}
            placeholder="https://example.com/image.jpg"
          />
          {errors.url && (
            <p className="text-xs text-destructive mt-1">
              {errors.url.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-text text-[10px] mb-1 block">
              Alt Text
            </label>
            <Input {...register("altText")} placeholder="Describe the image" />
          </div>
          <div>
            <label className="label-text text-[10px] mb-1 block">
              Sort Order
            </label>
            <Input
              type="number"
              min={0}
              {...register("sortOrder")}
              placeholder={String(existingCount)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="new-image-isPrimary"
            {...register("isPrimary")}
            className="h-4 w-4 rounded accent-primary"
          />
          <label
            htmlFor="new-image-isPrimary"
            className="text-xs text-on-surface-variant cursor-pointer"
          >
            Set as primary image
          </label>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              setIsOpen(false);
              setFormError(null);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1 gap-1.5"
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                Add Image
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

const EditImageFields = ({
  productId,
  images,
  onRefresh,
}: EditImageFieldsProps) => {
  const { add, remove, isAdding, deletingId } = useImageMutations(productId);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (imageId: string) => {
    setDeleteError(null);
    const result = await remove(imageId);
    if (result.success) {
      setConfirmDeleteId(null);
      onRefresh();
    } else {
      setDeleteError(result.error ?? "Failed to delete.");
    }
  };

  const handleAdd = async (data: ImageFormValues) => {
    const result = await add(data);
    if (result.success) onRefresh();
    return result;
  };

  return (
    <div className="bg-card rounded-2xl p-5 ghost-border">
      <div className="mb-4">
        <span className="label-text text-primary text-[10px]">IMAGES</span>
        <h3 className="text-sm font-bold text-on-surface mt-0.5">
          Product Images
          <span className="ml-2 text-xs font-normal text-on-surface-variant">
            ({images.length})
          </span>
        </h3>
      </div>

      {deleteError && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{deleteError}</p>
        </div>
      )}

      <div className="space-y-3">
        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-on-surface-variant/50">
            <ImageIcon className="h-7 w-7" />
            <p className="text-xs">No images yet.</p>
          </div>
        )}

        {images.map((image) => {
          const isDeleting = deletingId === image.id;
          const isConfirming = confirmDeleteId === image.id;

          return (
            <div
              key={image.id}
              className={`rounded-xl overflow-hidden ghost-border transition-colors ${
                image.isPrimary
                  ? "bg-primary/5 border-primary/20"
                  : "bg-surface-container-low"
              }`}
            >
              <div className="flex gap-3 p-3">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-surface-container shrink-0">
                  <img
                    src={image.url}
                    alt={image.altText ?? "Product image"}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    {image.isPrimary && (
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-on-surface truncate">
                      {image.isPrimary
                        ? "Primary"
                        : `Image ${image.sortOrder + 1}`}
                    </span>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-mono truncate max-w-[160px]">
                    {image.url}
                  </p>
                  {image.altText && (
                    <p className="text-xs text-on-surface-variant/60 mt-0.5 truncate">
                      {image.altText}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-lg"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteId(image.id);
                      setDeleteError(null);
                    }}
                    className="text-on-surface-variant hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {isConfirming && (
                <div className="px-3 pb-3 flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant flex-1">
                    Remove this image?
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-7 px-3 text-xs gap-1"
                    disabled={isDeleting}
                    onClick={() => handleDelete(image.id)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          );
        })}

        <AddImageForm
          onAdd={handleAdd}
          isAdding={isAdding}
          existingCount={images.length}
        />
      </div>
    </div>
  );
};

export default EditImageFields;
