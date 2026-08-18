import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useAddCar, useCars } from "@/api/cars";
import {
  CarFormFields,
  EMPTY_CAR_FORM,
  carFormStyles,
  validateCarForm,
  type CarFormValues,
} from "@/components/car-form-fields";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { useToast } from "@/providers/toast";

export default function AddCarScreen() {
  const { data: cars, isPending } = useCars();

  // Экран открывается из профиля, где список уже в кэше; ждём только на случай
  // прямого захода — без списка не узнать, первая это машина или нет.
  if (isPending || !cars) {
    return (
      <View style={carFormStyles.centered}>
        <ActivityIndicator color="#208AEF" />
      </View>
    );
  }

  return <AddCarForm isFirstCar={cars.length === 0} />;
}

function AddCarForm({ isFirstCar }: { isFirstCar: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const addCar = useAddCar();

  // Поля держим одним объектом: по отдельности это пачка несвязанных useState,
  // хотя меняются они всегда как одно целое — черновик машины.
  const [form, setForm] = useState<CarFormValues>(EMPTY_CAR_FORM);
  const [isDefault, setIsDefault] = useState(false);
  // Номер, который бэк отверг как дубль. Храним значение, а не флаг, чтобы
  // ошибка ушла сама, как только юзер поправит номер.
  const [takenPlate, setTakenPlate] = useState<string | null>(null);

  const setField = <K extends keyof CarFormValues>(
    key: K,
    value: CarFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors = validateCarForm(form);
  const plateConflict =
    form.plate === takenPlate ? "You already have a car with this plate." : null;

  const canSave =
    !!form.brand &&
    !errors.model &&
    !errors.plate &&
    !plateConflict &&
    !addCar.isPending;

  const onSave = () => {
    if (!canSave || !form.brand) return;

    addCar.mutate(
      {
        brandId: form.brand.id,
        model: form.model.trim(),
        plate: form.plate,
        color: form.color,
        // Первую машину бэк делает дефолтной сам — флаг слать незачем.
        ...(isFirstCar ? {} : { isDefault }),
      },
      {
        onSuccess: () => {
          showToast("Car added", "success");
          router.back();
        },
        onError: (err) => {
          // Конфликт номера привязан к конкретному полю — показываем под ним,
          // а не тостом, чтобы было видно, что именно править.
          if (getApiErrorStatus(err) === 409) {
            setTakenPlate(form.plate);
            return;
          }
          showToast(
            getApiErrorMessage(err, "Couldn't add the car. Please try again."),
            "error",
          );
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={carFormStyles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={carFormStyles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CarFormFields
          values={form}
          setField={setField}
          errors={errors}
          plateConflict={plateConflict}
          onSubmitEditing={onSave}
        />

        {/* Первой машине выключатель не нужен: бэк сделает её дефолтной в любом
            случае, а неработающий переключатель только сбивает с толку. */}
        {isFirstCar ? null : (
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={carFormStyles.label}>Set as default</Text>
              <Text style={carFormStyles.hint}>
                Used first when you park or book a spot.
              </Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ true: "#208AEF" }}
            />
          </View>
        )}

        <Pressable
          style={[carFormStyles.button, !canSave && carFormStyles.buttonDisabled]}
          disabled={!canSave}
          onPress={onSave}
        >
          <Text style={carFormStyles.buttonText}>
            {addCar.isPending ? "Saving…" : "Add car"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchText: {
    flex: 1,
    gap: 2,
  },
});
