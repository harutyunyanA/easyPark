import { StyleSheet, Text, View } from "react-native";

import { CAR_COLOR_HEX } from "@/lib/car-colors";
import { type CarColor } from "@/types/car.types";

// Кружок цвета машины: свотч в пикере и метка в списке машин.
// Обводка у всех, а не только у светлых — иначе белый и бежевый растворяются
// в карточке, а разная обводка по цветам выглядела бы неряшливо.
export function CarColorDot({
  color,
  size = 16,
}: {
  color: CarColor;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: CAR_COLOR_HEX[color],
        },
      ]}
    >
      {/* У "other" своего цвета нет — помечаем вопросом на нейтральной заливке. */}
      {color === "other" ? (
        <Text style={[styles.other, { fontSize: size * 0.55 }]}>?</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D3DCE6",
  },
  other: {
    color: "#4B5768",
    fontWeight: "700",
  },
});
