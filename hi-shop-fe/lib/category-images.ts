export const CATEGORY_IMAGE_BY_SLUG = {
  "bags-luggage": "/categories/bags-luggage.webp",
  "fashion-accessories": "/categories/fashion-accessories.webp",
  footwear: "/categories/footwear.webp",
  "mens-clothing": "/categories/mens-clothing.webp",
  watches: "/categories/watches.webp",
  "womens-clothing": "/categories/womens-clothing.webp",
} as const

export type CategorySlugWithLocalImage = keyof typeof CATEGORY_IMAGE_BY_SLUG

export function hasCategoryLocalImage(slug: string): slug is CategorySlugWithLocalImage {
  return slug in CATEGORY_IMAGE_BY_SLUG
}

export function getCategoryImagePath(
  slug: string,
): (typeof CATEGORY_IMAGE_BY_SLUG)[CategorySlugWithLocalImage] | undefined {
  return hasCategoryLocalImage(slug) ? CATEGORY_IMAGE_BY_SLUG[slug] : undefined
}
