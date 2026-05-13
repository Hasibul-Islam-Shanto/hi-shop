import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/app/routes/ProtectedRoute";
import GuestRoute from "@/app/routes/GuestRoute";
import { CookiesProvider } from "react-cookie";

const DashboardLayout = lazy(() => import("@/app/layouts/DashboardLayout"));
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage")
);
const InventoryPage = lazy(
  () => import("@/features/products/pages/InventoryPage")
);
const AddProductPage = lazy(
  () => import("@/features/products/pages/AddProductPage")
);
const EditProductPage = lazy(
  () => import("@/features/products/pages/EditProductPage")
);
const OrdersPage = lazy(() => import("@/features/orders/pages/OrdersPage"));
const UsersPage = lazy(() => import("@/features/users/pages/UsersPage"));
const ReviewsPage = lazy(() => import("@/features/reviews/pages/ReviewsPage"));
const DiscountsPage = lazy(
  () => import("@/features/discounts/pages/DiscountsPage")
);
const AnalyticsPage = lazy(
  () => import("@/features/analytics/pages/AnalyticsPage")
);
const CategoriesPage = lazy(
  () => import("@/features/categories/pages/CategoriesPage")
);
const LoginPage = lazy(() => import("@/features/auth/pages/login"));

const AppRouter = () => (
  <CookiesProvider>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/new" element={<AddProductPage />} />
              <Route path="inventory/:id/edit" element={<EditProductPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="discounts" element={<DiscountsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </CookiesProvider>
);

export default AppRouter;
