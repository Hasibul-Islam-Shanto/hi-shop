import { useAuthStore } from "@/shared/store/useAuthStore";
import { clearTokens, getAccessToken } from "@/axios/axios.helper";
import axiosInstance from "@/axios/axios.config";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = getAccessToken();
      if (token) {
        await axiosInstance.post("/auth/logout");
      }
    } catch {
      void 0;
    } finally {
      clearTokens();
      logout();
      navigate("/login");
    }
  };

  return { handleLogout };
};

export default useLogout;
