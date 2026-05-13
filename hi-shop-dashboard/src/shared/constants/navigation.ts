import {
  LayoutDashboard,
  PackageSearch,
  ShoppingCart,
  BarChart3,
  Tag,
  Users,
  Star,
  BadgePercent,
} from "lucide-react";

export const sidebarLinks = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "Inventory", icon: PackageSearch, path: "/admin/inventory" },
  { name: "Categories", icon: Tag, path: "/admin/categories" },
  { name: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Reviews", icon: Star, path: "/admin/reviews" },
  { name: "Discounts", icon: BadgePercent, path: "/admin/discounts" },
  { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
];

export const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/inventory": "Inventory",
  "/admin/inventory/new": "Add Product",
  "/admin/inventory/edit": "Edit Product",
  "/admin/categories": "Categories",
  "/admin/orders": "Orders",
  "/admin/users": "Users",
  "/admin/reviews": "Reviews",
  "/admin/discounts": "Discounts",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};
