import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/shared/store/useAuthStore";

const GuestRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
