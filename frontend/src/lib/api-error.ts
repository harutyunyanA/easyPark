import { isAxiosError } from "axios";

// Nest/class-validator отдаёт message строкой ("Invalid credentials")
// или массивом строк (ошибки полей DTO) — сводим к одному тексту для UI.
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (Array.isArray(message)) return message.join("\n");
    if (typeof message === "string") return message;
  }
  return fallback;
}
