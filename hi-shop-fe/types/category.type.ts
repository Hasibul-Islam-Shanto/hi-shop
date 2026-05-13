export interface ICategory {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  children: ICategory[]
  _count: {
    products: number
  }
}

export interface ICategoryResponse {
  categories: ICategory[]
}
