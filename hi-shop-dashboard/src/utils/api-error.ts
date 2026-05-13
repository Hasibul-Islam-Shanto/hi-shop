export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong.",
): string => {
  const data = (error as { response?: { data?: { message?: unknown } } })
    ?.response?.data;
  const message = data?.message;

  if (Array.isArray(message)) return message.join(", ");
  if (typeof message === "string") return message;
  if (error instanceof Error) return error.message;

  return fallback;
};
