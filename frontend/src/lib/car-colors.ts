import { type CarColor } from "@/types/car.types";

// Чем красим свотчи в пикере и кружки в списке машин. Бэк отдаёт только имена
// цветов, так что соответствие имя → hex живёт на фронте.
export const CAR_COLOR_HEX: Record<CarColor, string> = {
  white: "#FFFFFF",
  black: "#1A1A1A",
  gray: "#8A8F98",
  silver: "#C7CCD1",
  red: "#D93025",
  blue: "#1A73E8",
  green: "#188038",
  yellow: "#F2C200",
  orange: "#E8710A",
  brown: "#6D4C41",
  beige: "#E4D5B7",
  gold: "#C9A227",
  purple: "#7B3FA0",
  pink: "#E85D9E",
  bronze: "#A9713B",
  // Заглушка для "other": поверх неё рисуем "?", см. ColorSwatch.
  other: "#EDF0F4",
};

// "white" → "White". Бэк отдаёт значения enum в нижнем регистре.
export function carColorLabel(color: CarColor): string {
  return color.charAt(0).toUpperCase() + color.slice(1);
}
