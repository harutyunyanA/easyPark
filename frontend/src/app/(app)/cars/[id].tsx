import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useCars, useUpdateCar } from "@/api/cars";
import {
  CarFormFields,
  carFormStyles,
  validateCarForm,
  type CarFormValues,
} from "@/components/car-form-fields";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api-error";
import { useToast } from "@/providers/toast";
import { type Car, type UpdateCarInput } from "@/types/car.types";

export default function EditCarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: cars, isPending } = useCars();

  const car = cars?.find((item) => item.id === Number(id));

  if (isPending) {
    return (
      <View style={carFormStyles.centered}>
        <ActivityIndicator color="#208AEF" />
      </View>
    );
  }

  // Машину удалили с другого устройства или юзер пришёл по старой ссылке.
  if (!car) {
    return (
      <View style={carFormStyles.centered}>
        <Text style={carFormStyles.hint}>Car not found.</Text>
      </View>
    );
  }

  // key — чтобы форма пересобралась, если экран переиспользуют под другую машину.
  return <EditCarForm key={car.id} car={car} />;
}

function EditCarForm({ car }: { car: Car }) {
  const router = useRouter();
  const { showToast } = useToast();
  const updateCar = useUpdateCar(car.id);

  // Бренд собираем из brandId + brand: ровно та пара, ради которой мы перестали
  // выбрасывать brandId из ответа бэка — иначе пикер было бы нечем предвыбрать.
  const [form, setForm] = useState<CarFormValues>({
    brand: { id: car.brandId, name: car.brand },
    model: car.model,
    plate: car.plate,
    color: car.color,
  });
  const [takenPlate, setTakenPlate] = useState<string | null>(null);

  const setField = <K extends keyof CarFormValues>(
    key: K,
    value: CarFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const errors = validateCarForm(form);
  const plateConflict =
    form.plate === takenPlate ? "You already have a car with this plate." : null;

  // Шлём только то, что реально изменилось: PATCH частичный, а лишний plate
  // в теле заставил бы бэк перепроверять его на дубли без надобности.
  const changes: UpdateCarInput = {
    ...(form.brand && form.brand.id !== car.brandId
      ? { brandId: form.brand.id }
      : {}),
    ...(form.model.trim() !== car.model ? { model: form.model.trim() } : {}),
    ...(form.plate !== car.plate ? { plate: form.plate } : {}),
    ...(form.color !== car.color ? { color: form.color } : {}),
  };
  const hasChanges = Object.keys(changes).length > 0;

  const canSave =
    !!form.brand &&
    !errors.model &&
    !errors.plate &&
    !plateConflict &&
    hasChanges &&
    !updateCar.isPending;

  const onSave = () => {
    if (!canSave) return;

    updateCar.mutate(changes, {
      onSuccess: () => {
        showToast("Car updated", "success");
        router.back();
      },
      onError: (err) => {
        if (getApiErrorStatus(err) === 409) {
          setTakenPlate(form.plate);
          return;
        }
        showToast(
          getApiErrorMessage(err, "Couldn't save changes. Please try again."),
          "error",
        );
      },
    });
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

        <Pressable
          style={[
            carFormStyles.button,
            !canSave && carFormStyles.buttonDisabled,
          ]}
          disabled={!canSave}
          onPress={onSave}
        >
          <Text style={carFormStyles.buttonText}>
            {updateCar.isPending ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
