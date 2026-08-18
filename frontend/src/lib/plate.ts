// Армянский гражданский номер: 12AB345 или 123AB45 — семь символов в обоих
// случаях. Держим в синхроне с бэком: backend/src/cars/dto/createCar.dto.ts.
const PLATE_REGEX = /^(\d{2}[A-Z]{2}\d{3}|\d{3}[A-Z]{2}\d{2})$/;

export const PLATE_LENGTH = 7;

// Юзер набирает или вставляет номер как угодно: "12 AB 345", "12-ab-345".
// Оставляем только буквы и цифры, поднимаем регистр (бэк всё равно сделает
// toUpperCase, но в поле должно сразу выглядеть как на самом номере) и режем
// длину здесь, а не нативным maxLength — иначе вставка обрежется до очистки.
export function normalizePlate(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, PLATE_LENGTH);
}

// Возвращает текст ошибки или null, если номер валиден.
export function validatePlate(plate: string): string | null {
  if (!plate) return "Enter the license plate.";
  if (!PLATE_REGEX.test(plate)) {
    return "Plate must look like 12AB345 or 123AB45.";
  }
  return null;
}
