import { useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ProductForm {
  name: string;
  price: string;
  material: string;
  category: string;
  stock: string;
}

interface ProductModalProps {
  isEditing: boolean;
  form: ProductForm;
  imagePreview: string | null;
  onFormChange: (form: ProductForm) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onClose: () => void;
}

const ProductModal = ({
  isEditing,
  form,
  imagePreview,
  onFormChange,
  onImageChange,
  onSave,
  onClose,
}: ProductModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl p-5 w-full max-w-md ghost-border shadow-(--shadow-xl) animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-on-surface">
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label-text text-[10px] mb-1 block">Image</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-28 rounded-xl border-2 border-dashed border-outline-variant/30 hover:border-primary/50 transition-all duration-200 flex items-center justify-center overflow-hidden bg-surface-container-low"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-on-surface-variant">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs">Upload image</span>
                </div>
              )}
            </button>
          </div>

          <div>
            <label className="label-text text-[10px] mb-1 block">Name</label>
            <Input
              value={form.name}
              onChange={(e) => onFormChange({ ...form, name: e.target.value })}
              placeholder="Product name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-text text-[10px] mb-1 block">
                Price ($)
              </label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  onFormChange({ ...form, price: e.target.value })
                }
                placeholder="0"
              />
            </div>
            <div>
              <label className="label-text text-[10px] mb-1 block">Stock</label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) =>
                  onFormChange({ ...form, stock: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="label-text text-[10px] mb-1 block">
              Category
            </label>
            <Input
              value={form.category}
              onChange={(e) =>
                onFormChange({ ...form, category: e.target.value })
              }
              placeholder="e.g. Apparel"
            />
          </div>

          <div>
            <label className="label-text text-[10px] mb-1 block">
              Material
            </label>
            <Input
              value={form.material}
              onChange={(e) =>
                onFormChange({ ...form, material: e.target.value })
              }
              placeholder="e.g. Merino Wool"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="flex-1" size="sm" onClick={onSave}>
              {isEditing ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
