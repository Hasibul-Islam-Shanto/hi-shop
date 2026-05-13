import { z } from "zod";

const toOptStr = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const slugRule = z
  .string()
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters and hyphens only");

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.preprocess(toOptStr, slugRule.optional()),
  description: z.preprocess(toOptStr, z.string().max(500).optional()),
  parentId: z.preprocess(
    toOptStr,
    z.string().uuid("Must be a valid UUID").optional(),
  ),
});

export const updateCategorySchema = z.object({
  name: z.preprocess(toOptStr, z.string().min(1).max(100).optional()),
  slug: z.preprocess(toOptStr, slugRule.optional()),
  description: z.preprocess(toOptStr, z.string().max(500).optional()),
  parentId: z.preprocess(
    toOptStr,
    z.string().uuid("Must be a valid UUID").optional(),
  ),
});

export type CreateCategoryValues = z.infer<typeof createCategorySchema>;
export type UpdateCategoryValues = z.infer<typeof updateCategorySchema>;

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  _count: { products: number };
}
