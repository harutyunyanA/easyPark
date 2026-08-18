import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { BrandPickerModal } from "@/components/brand-picker-modal";
import { CarColorDot } from "@/components/car-color-dot";
import { carColorLabel } from "@/lib/car-colors";
import { normalizePlate, validatePlate } from "@/lib/plate";
import { CAR_COLORS, type CarBrand, type CarColor } from "@/types/car.types";

const MODEL_MAX_LENGTH = 100;

// Поля, общие для добавления и редактирования. isDefault сюда не входит:
// при создании это чекбокс в форме, при правке — отдельная ручка бэка.
export type CarFormValues = {
  brand: CarBrand | null;
  model: string;
  plate: string;
  color: CarColor;
};

export const EMPTY_CAR_FORM: CarFormValues = {
  brand: null,
  model: "",
  plate: "",
  // Совпадает с дефолтом колонки на бэке, но шлём явно — юзер видит, что выбрано.
  color: "white",
};

export type CarFormErrors = {
  model: string | null;
  plate: string | null;
};

// Валидация формы в одном месте, чтобы оба экрана одинаково решали,
// можно ли жать Save.
export function validateCarForm(values: CarFormValues): CarFormErrors {
  const model = values.model.trim();
  return {
    model: !model
      ? "Enter the model."
      : model.length > MODEL_MAX_LENGTH
        ? "Model name is too long."
        : null,
    plate: validatePlate(values.plate),
  };
}

export function CarFormFields({
  values,
  setField,
  errors,
  // Ошибка с сервера (409): экран передаёт её отдельно, потому что узнаёт
  // о ней только после ответа.
  plateConflict,
  onSubmitEditing,
}: {
  values: CarFormValues;
  setField: <K extends keyof CarFormValues>(
    key: K,
    value: CarFormValues[K],
  ) => void;
  errors: CarFormErrors;
  plateConflict?: string | null;
  onSubmitEditing?: () => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const plateError = plateConflict ?? errors.plate;

  return (
    <>
      <View style={styles.field}>
        <Text style={styles.label}>Brand</Text>
        <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
          <Text
            style={values.brand ? styles.selectValue : styles.selectPlaceholder}
          >
            {values.brand ? values.brand.name : "Select brand"}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9AA5B1" />
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          value={values.model}
          onChangeText={(input) => setField("model", input)}
          placeholder="Camry"
          placeholderTextColor="#9AA5B1"
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="next"
        />
        {/* Ошибку показываем, только когда в поле уже что-то есть: пустая
            форма при открытии краснеть не должна. */}
        {values.model && errors.model ? (
          <Text style={styles.error}>{errors.model}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>License plate</Text>
        <TextInput
          style={[styles.input, styles.plateInput]}
          value={values.plate}
          onChangeText={(input) => setField("plate", normalizePlate(input))}
          placeholder="12AB345"
          placeholderTextColor="#9AA5B1"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
        />
        {values.plate && plateError ? (
          <Text style={styles.error}>{plateError}</Text>
        ) : (
          <Text style={styles.hint}>Format: 12AB345 or 123AB45</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Color</Text>
        <View style={styles.swatches}>
          {CAR_COLORS.map((value) => (
            <Pressable
              key={value}
              style={[
                styles.swatch,
                value === values.color && styles.swatchSelected,
              ]}
              onPress={() => setField("color", value)}
              accessibilityLabel={carColorLabel(value)}
            >
              <CarColorDot color={value} size={28} />
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>{carColorLabel(values.color)}</Text>
      </View>

      <BrandPickerModal
        visible={pickerOpen}
        selectedId={values.brand?.id ?? null}
        onSelect={(selected) => {
          setField("brand", selected);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}

export const carFormStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#208AEF",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  label: {
    color: "#000",
    fontWeight: "500",
  },
  hint: {
    color: "#9AA5B1",
    fontSize: 13,
  },
});

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: carFormStyles.label,
  input: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 8,
    fontSize: 16,
    color: "#1F2933",
  },
  plateInput: {
    // Номер читается как код, а не как слово — разрядка помогает не слипаться
    // цифрам с буквами.
    letterSpacing: 2,
    fontWeight: "600",
  },
  select: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 8,
  },
  selectValue: {
    fontSize: 16,
    color: "#1F2933",
  },
  selectPlaceholder: {
    fontSize: 16,
    color: "#9AA5B1",
  },
  swatches: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  swatch: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchSelected: {
    borderColor: "#208AEF",
  },
  hint: carFormStyles.hint,
  error: {
    color: "#DC2626",
    fontSize: 13,
  },
});
