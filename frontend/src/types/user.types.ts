export type CreateUser = {
  name: string;
  email: string;
  password: string;
};

// Форма ответа GET /auth/me: весь user-entity без скрытых хэшей.
// Даты приходят ISO-строками (JSON), cars сюда НЕ входят (relation грузится отдельно).
export type User = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  // Готовый публичный URL — бэк собирает его из ключа объекта в R2, поэтому
  // домен бакета в приложении нигде не зашит.
  avatarUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  tokenBalance: number;
  createdAt: string;
  updatedAt: string;
};
