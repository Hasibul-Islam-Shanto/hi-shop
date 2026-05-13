import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCategorySchema,
  type CreateCategoryValues,
  type CategoryItem,
} from "../schemas/category.schema";

interface CategoryModalProps {
  isEditing: boolean;
  editTarget: CategoryItem | null;
  categories: CategoryItem[];
  isSubmitting: boolean;
  onSave: (data: CreateCategoryValues, id?: string) => void;
  onClose: () => void;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const CategoryModal = ({
  isEditing,
  editTarget,
  categories,
  isSubmitting,
  onSave,
  onClose,
}: CategoryModalProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryValues>({
    resolver: zodResolver(
      createCategorySchema,
    ) as Resolver<CreateCategoryValues>,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentId: "",
    },
  });

  useEffect(() => {
    if (isEditing && editTarget) {
      reset({
        name: editTarget.name,
        slug: editTarget.slug,
        description: editTarget.description ?? "",
        parentId: editTarget.parentId ?? "",
      });
    } else {
      reset({ name: "", slug: "", description: "", parentId: "" });
    }
  }, [isEditing, editTarget, reset]);

  const nameValue = watch("name");

  const handleNameBlur = () => {
    const currentSlug = watch("slug");
    if (!currentSlug && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  };

  const onSubmit = (data: CreateCategoryValues) => {
    onSave(data, isEditing && editTarget ? editTarget.id : undefined);
  };

  const parentOptions = categories.filter((c) =>
    isEditing && editTarget ? c.id !== editTarget.id : true,
  );

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-md ghost-border shadow-(--shadow-xl) animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-on-surface">
            {isEditing ? "Edit Category" : "Add Category"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text text-[10px] mb-1 block">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("name")}
              onBlur={handleNameBlur}
              placeholder="e.g. Sneakers"
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
            <Input {...register("slug")} placeholder="sneakers" />
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
              rows={3}
              placeholder="Short description (max 500 chars)…"
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none ghost-border focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="label-text text-[10px] mb-1 block">
              Parent Category
              <span className="text-on-surface-variant ml-1 text-[9px]">
                (leave empty for top-level)
              </span>
            </label>
            <select
              {...register("parentId")}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface ghost-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-200"
            >
              <option value="">— None (top-level) —</option>
              {parentOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.parentId && (
              <p className="text-xs text-destructive mt-1">
                {errors.parentId.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gap-1.5"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Category"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
