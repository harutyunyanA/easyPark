import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { File } from "expo-file-system";
import { meQueryKey } from "@/api/auth";
import { api } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { pickAvatarImage } from "@/lib/avatar-image";
import { useToast } from "@/providers/toast";
import { type User } from "@/types/user.types";

type UploadUrlResponse = {
  key: string;
  uploadUrl: string;
  maxBytes: number;
  expiresIn: number;
};

/**
 * Загрузка аватара в три шага: бэк подписывает ссылку → файл летит напрямую
 * в R2 (мимо бэка, чтобы не тратить его трафик) → бэк подтверждает ключ,
 * проверив размер и тип уже залитого объекта.
 */
async function uploadAvatar(uri: string, contentType: string): Promise<User> {
  const { data: presigned } = await api.post<UploadUrlResponse>(
    "/users/me/avatar/upload-url",
    { contentType },
  );

  // ArrayBuffer, а не сам File: expo-file-system реализует интерфейс Blob лишь
  // на уровне типов, а RN проверяет тело через `instanceof Blob` своего класса.
  // Не совпало — тело уйдёт строкой "[object Object]".
  const body = await new File(uri).arrayBuffer();

  // Голый axios, а не наш api: request-интерцептор навесил бы Authorization,
  // и R2 попытался бы разобрать его как свою подпись вместо той, что уже лежит
  // в query-параметрах. Тот же приём, что в doRefresh (api/client.ts).
  await axios.put(presigned.uploadUrl, body, {
    headers: { "Content-Type": contentType },
  });

  const { data: user } = await api.put<User>("/users/me/avatar", {
    key: presigned.key,
  });
  return user;
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const picked = await pickAvatarImage();

      // Ни отмена, ни отказ в доступе не должны идти через onError:
      // getApiErrorMessage разбирает только axios-ошибки, и текст обычного
      // Error потерялся бы, показав юзеру бесполезное "try again".
      if (picked.status !== "picked") {
        if (picked.status === "permission-denied") {
          showToast(
            "Allow photo access in Settings to set a profile picture.",
            "error",
          );
        }
        return null;
      }

      return uploadAvatar(picked.uri, picked.contentType);
    },
    onSuccess: (user) => {
      if (user) {
        queryClient.setQueryData(meQueryKey, user);
      }
    },
    onError: (err) =>
      showToast(
        getApiErrorMessage(err, "Couldn't update the photo. Please try again."),
        "error",
      ),
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<User>("/users/me/avatar");
      return data;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user);
    },
    onError: (err) =>
      showToast(
        getApiErrorMessage(err, "Couldn't remove the photo. Please try again."),
        "error",
      ),
  });
}
