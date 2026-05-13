import { z } from "zod";

const toOptStr = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const toOptNum = (v: unknown) =>
  v === "" || v === undefined || v === null ? undefined : Number(v);

export const imageSchema = z.object({
  url: z.string().url("Must be a valid URL").max(2048),
  altText: z.preprocess(toOptStr, z.string().max(255).optional()),
  isPrimary: z.boolean().default(false),
  sortOrder: z.preprocess(
    toOptNum,
    z.number().int("Whole number").min(0).optional()
  ),
});

export const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(100),
  size: z.preprocess(toOptStr, z.string().max(50).optional()),
  color: z.preprocess(toOptStr, z.string().max(50).optional()),
  stock: z.coerce.number().int("Must be a whole number").min(0, "Min 0"),
  priceModifier: z.preprocess(
    toOptNum,
    z.number().min(0, "Min 0").optional()
  ),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  categoryId: z.string().uuid("Must be a valid category UUID"),
  name: z.string().min(1, "Name is required").max(255),
  slug: z.preprocess(
    toOptStr,
    z
      .string()
      .max(255)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Lowercase letters and hyphens only"
      )
      .optional()
  ),
  description: z.preprocess(
    toOptStr,
    z.string().max(2000).optional()
  ),
  basePrice: z.coerce.number().min(0, "Price must be 0 or greater"),
  isActive: z.boolean().default(true),
  variants: z
    .array(variantSchema)
    .min(1, "At least one variant is required"),
  images: z.array(imageSchema).optional(),
});

export const updateProductSchema = z.object({
  categoryId: z.preprocess(toOptStr, z.string().uuid("Must be a valid UUID").optional()),
  name: z.preprocess(toOptStr, z.string().min(1).max(255).optional()),
  slug: z.preprocess(
    toOptStr,
    z
      .string()
      .max(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters and hyphens only")
      .optional()
  ),
  description: z.preprocess(toOptStr, z.string().max(2000).optional()),
  basePrice: z.preprocess(toOptNum, z.number().min(0).optional()),
  isActive: z.boolean().optional(),
});

export const updateVariantSchema = z.object({
  sku: z.preprocess(toOptStr, z.string().max(100).optional()),
  size: z.preprocess(toOptStr, z.string().max(50).optional()),
  color: z.preprocess(toOptStr, z.string().max(50).optional()),
  stock: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : Number(v)),
    z.number().int("Must be a whole number").min(0, "Min 0").optional()
  ),
  priceModifier: z.preprocess(toOptNum, z.number().min(0).optional()),
  isActive: z.boolean().optional(),
});

export const adjustInventorySchema = z.object({
  stock: z.coerce.number().int("Must be a whole number").min(0, "Min 0"),
  note: z.string().min(1, "Note is required").max(255),
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantFormValues = z.infer<typeof variantSchema>;
export type ImageFormValues = z.infer<typeof imageSchema>;
export type UpdateProductValues = z.infer<typeof updateProductSchema>;
export type UpdateVariantValues = z.infer<typeof updateVariantSchema>;
export type AdjustInventoryValues = z.infer<typeof adjustInventorySchema>;
