// Держим синхронно с бэковым @IsStrongPassword в users/dto/create-user.dto.ts
// (minLength 8, minLowercase 1, minUppercase 1, minNumbers 1, minSymbols 0).
// Если правила на бэке поменяются — правим здесь же, иначе форма и валидатор разойдутся.
export type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
];

export function isStrongPassword(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}
