import axios from "axios";
import mem from "mem";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const getCookie = (name: string): string | null => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

const setCookie = (name: string, value: string, days = 30): void => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const removeCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const getAccessToken = (): string | null => getCookie(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  getCookie(REFRESH_TOKEN_KEY);

export const setTokens = (access: string, refresh: string): void => {
  setCookie(ACCESS_TOKEN_KEY, access);
  setCookie(REFRESH_TOKEN_KEY, refresh);
};

export const clearTokens = (): void => {
  removeCookie(ACCESS_TOKEN_KEY);
  removeCookie(REFRESH_TOKEN_KEY);
};

const refreshToken = async () => {
  try {
    const existingRefreshToken = getCookie(REFRESH_TOKEN_KEY);
    if (!existingRefreshToken) {
      throw new Error("No refresh token found");
    }
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      {
        refreshToken: existingRefreshToken,
      },
    );
    console.log("🚀 ~ refreshToken ~ data:", data.statusCode);
    const { accessToken, refreshToken } = data;

    setCookie(ACCESS_TOKEN_KEY, accessToken);

    setCookie(REFRESH_TOKEN_KEY, refreshToken);
    return accessToken;
  } catch (error) {
    clearTokens();
    throw error;
  }
};

export const memoizedRefreshToken = mem(refreshToken, {
  maxAge: 10000,
});
