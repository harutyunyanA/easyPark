import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/client";
import { getApiErrorMessage } from "@/lib/api-error";
import { useToast } from "@/providers/toast";
import {
  type Car,
  type CarBrand,
  type CreateCarInput,
  type UpdateCarInput,
} from "@/types/car.types";

// Лимит из CARS_LIMIT_PER_USER на бэке (cars.service.ts). Дублируем, чтобы
// показать счётчик и погасить кнопку до похода на сервер — 403 всё равно
// обрабатываем, но упереться в него после заполнения формы обидно.
export const CARS_LIMIT = 5;

export const carsQueryKey = ["cars"] as const;
export const carBrandsQueryKey = ["car-brands"] as const;

export function useCars() {
  return useQuery({
    queryKey: carsQueryKey,
    queryFn: async () => {
      const { data } = await api.get<Car[]>("/cars");
      return data;
    },
  });
}

// Справочник на 120+ записей, который не меняется без деплоя миграции —
// тянем один раз за запуск приложения и больше не перезапрашиваем.
export function useCarBrands() {
  return useQuery({
    queryKey: carBrandsQueryKey,
    queryFn: async () => {
      const { data } = await api.get<CarBrand[]>("/cars/brands");
      return data;
    },
    staleTime: Infinity,
  });
}

// Ошибки намеренно не тостим здесь: 409 (дубль номера) форма показывает под
// полем plate, а не всплывашкой. Решает вызывающий, см. cars/new.tsx.
export function useAddCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCarInput) => {
      const { data } = await api.post<Car>("/cars", input);
      return data;
    },
    onSuccess: (car) => {
      queryClient.setQueryData<Car[]>(carsQueryKey, (cars = []) => {
        // Бэк снимает флаг с прежней дефолтной в той же транзакции — повторяем
        // это в кэше, иначе в списке на секунду окажется два дефолта.
        const rest = car.isDefault
          ? cars.map((c) => ({ ...c, isDefault: false }))
          : cars;
        // Список приходит отсортированным по createdAt ASC, новая — последняя.
        return [...rest, car];
      });
    },
  });
}

// Как и useAddCar, ошибки отдаёт вызывающему: 409 на занятый номер форма
// редактирования показывает под полем plate.
export function useUpdateCar(carId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateCarInput) => {
      const { data } = await api.patch<Car>(`/cars/${carId}`, input);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Car[]>(carsQueryKey, (cars = []) =>
        cars.map((car) => (car.id === updated.id ? updated : car)),
      );
    },
  });
}

// Дальше — действия из контекстного меню. У них нет поля, к которому можно
// привязать ошибку, поэтому тостят сами, в отличие от add/update.
export function useSetDefaultCar() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (carId: number) => {
      const { data } = await api.patch<Car>(`/cars/${carId}/default`);
      return data;
    },
    onSuccess: (updated) => {
      // Бэк снимает флаг с прежней дефолтной — повторяем это в кэше.
      queryClient.setQueryData<Car[]>(carsQueryKey, (cars = []) =>
        cars.map((car) =>
          car.id === updated.id ? updated : { ...car, isDefault: false },
        ),
      );
    },
    onError: (err) =>
      showToast(
        getApiErrorMessage(err, "Couldn't change the default car."),
        "error",
      ),
  });
}

export function useRemoveCar() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (carId: number) => {
      await api.delete(`/cars/${carId}`);
    },
    // Удаляя дефолтную, бэк передаёт флаг следующей машине, но в ответе DELETE
    // пусто — кто стал дефолтным, знает только сервер. Поэтому перезапрашиваем
    // список целиком, а не правим кэш руками.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: carsQueryKey }),
    onError: (err) =>
      showToast(getApiErrorMessage(err, "Couldn't delete the car."), "error"),
  });
}
