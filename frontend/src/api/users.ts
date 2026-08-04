import { useMutation, useQueryClient } from "@tanstack/react-query";

import { meQueryKey } from "@/api/auth";
import { api } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { useToast } from "@/providers/toast";
import { type User } from "@/types/user.types";

// Поля, которые бэк разрешает менять через PATCH /users/me (см. UpdateUserDto).
// Аватар сюда не входит — у него свой флоу, см. api/avatar.ts.
export type UpdateProfileInput = {
  name?: string;
  phone?: string;
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const { data } = await api.patch<User>("/users/me", input);
      return data;
    },
    // Бэк отдаёт свежий профиль — кладём его прямо в кэш ["me"], чтобы экран
    // профиля обновился без лишнего рефетча.
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user);
    },
    onError: (err) =>
      showToast(
        getApiErrorMessage(err, "Couldn't save changes. Please try again."),
        "error",
      ),
  });
}
