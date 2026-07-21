import { useMutation } from "@tanstack/react-query";

import { api } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { type AuthTokens } from "@/lib/auth-storage";
import { useSession } from "@/providers/auth";
import { useToast } from "@/providers/toast";
import { type CreateUser } from "@/types/user.types";

export type SignInInput = {
  email: string;
  password: string;
};

// И /auth/login, и /auth/register отдают одинаковую пару токенов и одинаково
// поднимают сессию — общий колбэк, чтобы не дублировать между хуками.
function useSignInWithTokens() {
  const { signIn } = useSession();
  return (tokens: AuthTokens) =>
    signIn({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
}

export function useLogin() {
  const onSuccess = useSignInWithTokens();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data } = await api.post<AuthTokens>("/auth/login", input);
      return data;
    },
    // signIn поднимает isAuthenticated → guard в RootNavigator перекинет в (app).
    onSuccess,
    onError: (err) =>
      showToast(
        getApiErrorMessage(err, "Couldn't sign in. Please try again."),
        "error",
      ),
  });
}

export function useRegister() {
  const onSuccess = useSignInWithTokens();
  const { showToast } = useToast();

  return useMutation({
    // Шлём только input (name/email/password) — confirmPassword бэку не нужен.
    mutationFn: async (input: CreateUser) => {
      const { data } = await api.post<AuthTokens>("/auth/register", input);
      return data;
    },
    onSuccess,
    onError: (err) =>
      showToast(
        getApiErrorMessage(err, "Couldn't sign up. Please try again."),
        "error",
      ),
  });
}
