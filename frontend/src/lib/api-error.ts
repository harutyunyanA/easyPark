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

// HTTP-статус ответа, если ошибка вообще пришла от сервера. Нужен там, где
// разные коды рисуются по-разному: 409 на дубль номера — инлайн под полем,
// остальное — тостом.
export function getApiErrorStatus(err: unknown): number | undefined {
  return isAxiosError(err) ? err.response?.status : undefined;
}
