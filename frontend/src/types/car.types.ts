// Значения enum CarColor с бэка (backend/src/cars/carsColors.ts). Держим списком
// здесь, а не тянем GET /cars/colors: без локальной мапы цвет → hex голые строки
// с бэка всё равно нечем нарисовать, см. lib/car-colors.ts.
export const CAR_COLORS = [
  "white",
  "black",
  "gray",
  "silver",
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "brown",
  "beige",
  "gold",
  "purple",
  "pink",
  "bronze",
  "other",
] as const;

export type CarColor = (typeof CAR_COLORS)[number];

// Форма ответа GET /cars/brands.
export type CarBrand = {
  id: number;
  name: string;
};

// Форма ответа всех /cars-эндпоинтов (см. flattenCar в cars.service.ts).
// brand — готовое название для показа, brandId — то, что принимают POST/PATCH.
export type Car = {
  id: number;
  brandId: number;
  brand: string;
  model: string;
  color: CarColor;
  plate: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCarInput = {
  brandId: number;
  model: string;
  plate: string;
  color?: CarColor;
  isDefault?: boolean;
};

// PATCH /cars/:id принимает те же поля, кроме isDefault: дефолтную машину
// переключает отдельная ручка PATCH /cars/:id/default (см. UpdateCarDto).
export type UpdateCarInput = Partial<Omit<CreateCarInput, "isDefault">>;
