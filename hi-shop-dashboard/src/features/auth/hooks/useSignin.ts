import { useState } from "react";
import { isAxiosError } from "axios";
import axiosInstance from "@/axios/axios.config";
import { useCookies } from "react-cookie";
import { useAuthStore } from "@/shared/store/useAuthStore";

type SignInResult =
  | { success: true }
  | { success: false; error: string };

interface CookieValues {
  accessToken?: string;
  refreshToken?: string;
}

const useSignin = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuthStore();
  const [, setCookie] = useCookies<"accessToken" | "refreshToken", CookieValues>(
    ["accessToken", "refreshToken"],
  );

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    setIsSigningIn(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = data;
      setCookie("accessToken", accessToken);
      setCookie("refreshToken", refreshToken);
      login(user);
      return { success: true };
    } catch (err: unknown) {
      const message =
        isAxiosError(err) && err.response?.data?.message
          ? Array.isArray(err.response.data.message)
            ? err.response.data.message.join(", ")
            : err.response.data.message
          : err instanceof Error
          ? err.message
          : "An unknown error occurred";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsSigningIn(false);
    }
  };

  return { signIn, isSigningIn, error };
};

export default useSignin;
