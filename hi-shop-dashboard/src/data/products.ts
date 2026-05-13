export interface Product {
  id: string;
  name: string;
  price: number;
  material: string;
  category: string;
  stock: number;
  image: string;
}

export const allProducts: Product[] = [
  {
    id: "1",
    name: "Aris Sculpture Coat",
    price: 895,
    material: "Boiled Wool",
    category: "Outerwear",
    stock: 24,
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
  },
  {
    id: "2",
    name: "Orbital Frame Bag",
    price: 1250,
    material: "Full-Grain Leather",
    category: "Accessories",
    stock: 8,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
  },
  {
    id: "3",
    name: "Cloud Cashmere Rollneck",
    price: 445,
    material: "Grade-A Cashmere",
    category: "Knitwear",
    stock: 32,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
  },
  {
    id: "4",
    name: "Studio Audio One",
    price: 350,
    material: "Aluminium / Leather",
    category: "Electronics",
    stock: 15,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
  },
  {
    id: "5",
    name: "Flux Terrain Runner",
    price: 320,
    material: "Recycled Mesh",
    category: "Footwear",
    stock: 41,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  },
  {
    id: "6",
    name: "Editorial Linen Blazer",
    price: 695,
    material: "Belgian Linen",
    category: "Tailoring",
    stock: 3,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    id: "7",
    name: "Minimal Watch Series 3",
    price: 1890,
    material: "Sapphire / Steel",
    category: "Accessories",
    stock: 0,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  },
  {
    id: "8",
    name: "Drift Cargo Trouser",
    price: 285,
    material: "Cotton Twill",
    category: "Bottoms",
    stock: 19,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80",
  },
];
