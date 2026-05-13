import axios from "axios";
import request from "./axios.request";
import { createResponseInterceptor } from "./axios.response";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  request.onRequest,
  request.onRequestError,
);

const { onResponse, onResponseError } =
  createResponseInterceptor(axiosInstance);

axiosInstance.interceptors.response.use(onResponse, onResponseError);

export default axiosInstance;
