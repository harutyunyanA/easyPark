import { useMe } from "@/api/auth";
import { useUpdateProfile, type UpdateProfileInput } from "@/api/users";
import { useToast } from "@/providers/toast";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Регистрируем только армянские номера, поэтому код страны несъёмный, а в инпуте
// живёт только национальная часть — в Армении это всегда ровно 8 цифр
// (мобильные 91 234567, Ереван 10 123456, регионы 232 12345).
const AM_CODE = "+374";
const AM_NATIONAL_LENGTH = 8;

// Юзер может набрать или вставить номер в любом виде: +374 91 23 45 67, 091234567,
// 91-23-45-67. Оставляем цифры и срезаем то, что дублирует код страны или
// междугородний ноль — но только если цифр и так больше нормы, иначе съели бы
// начало номера, который юзер ещё набирает.
function toNationalDigits(input: string) {
  let digits = input.replace(/\D/g, "");
  if (digits.length > AM_NATIONAL_LENGTH && digits.startsWith("374")) {
    digits = digits.slice(3);
  }
  if (digits.length > AM_NATIONAL_LENGTH && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, AM_NATIONAL_LENGTH);
}

type Field = "name" | "phone";

// Всё, чем экран имени отличается от экрана телефона, собрано в одном месте —
// сам рендер и логика сохранения общие.
const FIELD_CONFIG: Record<
  Field,
  {
    label: string;
    placeholder: string;
    keyboardType: "default" | "phone-pad";
    autoCapitalize: "words" | "none";
    successMessage: string;
    // Несъёмный префикс: рисуется слева от инпута, в стейт не попадает и
    // приклеивается к значению перед отправкой на бэк.
    prefix: string;
    // Фильтрует то, что юзер набрал или вставил, до попадания в стейт.
    // Здесь же режем длину — нативный maxLength обрезал бы вставку до нормализации.
    normalize: (input: string) => string;
    // Возвращает текст ошибки или null, если значение валидно.
    validate: (value: string) => string | null;
  }
> = {
  name: {
    label: "Full name",
    placeholder: "Your name",
    keyboardType: "default",
    autoCapitalize: "words",
    successMessage: "Name updated",
    prefix: "",
    normalize: (input) => input,
    validate: (value) => {
      const trimmed = value.trim();
      if (trimmed.length < 2) return "Name must be at least 2 characters.";
      if (trimmed.length > 255) return "Name is too long.";
      return null;
    },
  },
  phone: {
    label: "Phone number",
    placeholder: "91234567",
    keyboardType: "phone-pad",
    autoCapitalize: "none",
    successMessage: "Phone number updated",
    prefix: AM_CODE,
    normalize: toNationalDigits,
    validate: (value) =>
      value.length === AM_NATIONAL_LENGTH
        ? null
        : `Enter the ${AM_NATIONAL_LENGTH} digits after ${AM_CODE}, e.g. 91234567.`,
  },
};

// В инпуте показываем значение без префикса: то, что юзер реально правит.
function toInputValue(stored: string, config: (typeof FIELD_CONFIG)[Field]) {
  if (!config.prefix) return stored;
  const withoutPrefix = stored.startsWith(config.prefix)
    ? stored.slice(config.prefix.length)
    : stored;
  return config.normalize(withoutPrefix);
}

export function EditFieldScreen({ field }: { field: Field }) {
  const { data: me, isPending } = useMe();

  // Экран открывается из профиля, где me уже в кэше, но подстрахуемся на случай
  // прямого захода (deeplink/перезапуск) — форму монтируем только с готовыми данными.
  if (isPending || !me) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#208AEF" />
      </View>
    );
  }

  return (
    <FieldForm
      field={field}
      initialValue={toInputValue(me[field] ?? "", FIELD_CONFIG[field])}
    />
  );
}

function FieldForm({
  field,
  initialValue,
}: {
  field: Field;
  initialValue: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const updateProfile = useUpdateProfile();
  const config = FIELD_CONFIG[field];

  const [value, setValue] = useState(initialValue);

  const trimmed = value.trim();
  const error = config.validate(trimmed);
  const changed = trimmed !== initialValue.trim();
  const canSave = !error && changed && !updateProfile.isPending;

  const onSave = () => {
    if (!canSave) return;
    // Префикс не редактируется, поэтому склеиваем его с введённым только здесь.
    const stored = config.prefix + trimmed;
    const payload: UpdateProfileInput =
      field === "name" ? { name: stored } : { phone: stored };
    updateProfile.mutate(payload, {
      onSuccess: () => {
        showToast(config.successMessage, "success");
        router.back();
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <View style={styles.field}>
          <Text style={styles.label}>{config.label}</Text>
          {/* Рамка на обёртке, а не на инпуте: префикс должен выглядеть частью поля. */}
          <View style={styles.inputWrapper}>
            {config.prefix ? (
              <Text style={styles.prefix}>{config.prefix}</Text>
            ) : null}
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={(input) => setValue(config.normalize(input))}
              placeholder={config.placeholder}
              placeholderTextColor="#9AA5B1"
              keyboardType={config.keyboardType}
              autoCapitalize={config.autoCapitalize}
              autoCorrect={false}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={onSave}
            />
          </View>
          {/* Ошибку показываем, только когда юзер уже что-то изменил, чтобы не
              краснеть сразу при открытии пустого/невалидного поля. */}
          {error && changed ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}
        </View>

        <Pressable
          style={[styles.button, !canSave && styles.buttonDisabled]}
          disabled={!canSave}
          onPress={onSave}
        >
          <Text style={styles.buttonText}>
            {updateProfile.isPending ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    gap: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#000",
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  prefix: {
    marginRight: 6,
    fontSize: 16,
    // Приглушённый, чтобы читалось как нередактируемая часть поля.
    color: "#4B5768",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2933",
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
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
  },
});
