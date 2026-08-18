import { useMe } from "@/api/auth";
import { useRemoveAvatar, useUpdateAvatar } from "@/api/avatar";
import {
  CARS_LIMIT,
  useCars,
  useRemoveCar,
  useSetDefaultCar,
} from "@/api/cars";
import { CarColorDot } from "@/components/car-color-dot";
import { getApiErrorMessage } from "@/lib/api-error";
import { type Car } from "@/types/car.types";
import { MenuView } from "@expo/ui/community/menu";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { type ComponentProps } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

// Одна строка-настройка: иконка · лейбл · (значение) · chevron.
// onPress пока опционален — экраны редактирования подключим позже.
function Row({
  icon,
  label,
  value,
  placeholder,
  onPress,
  disabled,
}: {
  icon: IconName;
  label: string;
  value?: string;
  // Показывается красным, когда value пустой — значит поле ещё не заполнено.
  placeholder?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={[styles.row, disabled && styles.rowDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={20} color="#4B5768" />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? (
          <Text style={styles.rowValue}>{value}</Text>
        ) : placeholder ? (
          <Text style={styles.rowPlaceholder}>{placeholder}</Text>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color="#9AA5B1" />
      </View>
    </Pressable>
  );
}

// Строка машины: кружок цвета вместо иконки, номер под названием, метка у той,
// что подставляется по умолчанию. Действия — долгим нажатием: MenuView сам
// служит триггером, поэтому своего Pressable здесь нет.
function CarRow({
  car,
  busy,
  onEdit,
  onSetDefault,
  onDelete,
}: {
  car: Car;
  // Пока идёт мутация по этой машине — приглушаем строку.
  busy: boolean;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <MenuView
      shouldOpenOnLongPress
      title={`${car.brand} ${car.model}`}
      actions={[
        { id: "edit", title: "Edit", image: "pencil" },
        {
          id: "default",
          title: "Set as default",
          image: "star",
          // Галочка у текущей дефолтной, и жать по ней уже незачем.
          state: car.isDefault ? "on" : "off",
          attributes: { disabled: car.isDefault },
        },
        {
          id: "delete",
          title: "Delete",
          image: "trash",
          attributes: { destructive: true },
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === "edit") onEdit();
        else if (nativeEvent.event === "default") onSetDefault();
        else if (nativeEvent.event === "delete") onDelete();
      }}
    >
      <View style={[styles.carRow, busy && styles.rowDisabled]}>
        <CarColorDot color={car.color} size={20} />
        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>
            {car.brand} {car.model}
          </Text>
          <Text style={styles.carPlate}>{car.plate}</Text>
        </View>
        {car.isDefault ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DEFAULT</Text>
          </View>
        ) : null}
      </View>
    </MenuView>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data: me, isPending, isError, error, refetch } = useMe();
  const updateAvatar = useUpdateAvatar();
  const removeAvatar = useRemoveAvatar();
  const isAvatarBusy = updateAvatar.isPending || removeAvatar.isPending;

  // Список машин грузим здесь же: экран добавления читает его из того же кэша,
  // чтобы понять, первая машина или нет.
  const { data: cars, isPending: carsPending, isError: carsError } = useCars();
  const atCarsLimit = (cars?.length ?? 0) >= CARS_LIMIT;

  const setDefaultCar = useSetDefaultCar();
  const removeCar = useRemoveCar();

  // Удаление необратимо, поэтому переспрашиваем — и показываем, какую именно
  // машину сносим: в меню юзер мог промахнуться строкой.
  const confirmDeleteCar = (car: Car) => {
    Alert.alert("Delete car?", `${car.brand} ${car.model} · ${car.plate}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => removeCar.mutate(car.id),
      },
    ]);
  };

  // react-query отдаёт аргументы текущей мутации — по ним понимаем, какая
  // именно строка сейчас занята.
  const isCarBusy = (carId: number) =>
    (setDefaultCar.isPending && setDefaultCar.variables === carId) ||
    (removeCar.isPending && removeCar.variables === carId);

  // Есть фото — сначала спрашиваем, менять или удалять; нет — сразу галерея.
  const onAvatarPress = () => {
    if (isAvatarBusy) return;

    if (!me?.avatarUrl) {
      updateAvatar.mutate();
      return;
    }

    Alert.alert("Profile photo", undefined, [
      { text: "Change photo", onPress: () => updateAvatar.mutate() },
      {
        text: "Remove photo",
        style: "destructive",
        onPress: () => removeAvatar.mutate(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (isPending) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#208AEF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={40} color="#9AA5B1" />
        <Text style={styles.errorText}>
          {getApiErrorMessage(error, "Couldn't load profile.")}
        </Text>
        <Pressable style={styles.retry} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Pressable
            style={styles.avatarPressable}
            onPress={onAvatarPress}
            disabled={isAvatarBusy}
          >
            {({ pressed }) => (
              <>
                {me.avatarUrl ? (
                  <Image
                    source={{ uri: me.avatarUrl }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons name="person" size={40} color="#208AEF" />
                )}
                <View style={styles.edit}>
                  <Ionicons name="pencil-outline" size={10} color="#fff" />
                  <Text style={styles.editText}>Edit</Text>
                </View>
                {pressed ? (
                  <View style={styles.pressOverlay} pointerEvents="none" />
                ) : null}
                {isAvatarBusy ? (
                  <View style={styles.avatarBusy} pointerEvents="none">
                    <ActivityIndicator color="#fff" />
                  </View>
                ) : null}
              </>
            )}
          </Pressable>
        </View>
        <Text style={styles.name}>{me.name}</Text>
        <Text style={styles.hint}>{me.email}</Text>
        <View style={styles.tokens}>
          <Ionicons name="wallet-outline" size={14} color="#208AEF" />
          <Text style={styles.tokensText}>{me.tokenBalance} tokens</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>PERSONAL INFO</Text>
      <View style={styles.card}>
        <Row
          icon="person-outline"
          label="Name"
          value={me.name}
          onPress={() => router.push("/edit/name")}
        />
        <View style={styles.divider} />
        <Row
          icon="call-outline"
          label="Phone"
          value={me.phone ?? undefined}
          placeholder="Not set"
          onPress={() => router.push("/edit/phone")}
        />
      </View>

      <Text style={styles.sectionTitle}>PAYMENT</Text>
      <View style={styles.card}>
        <Row icon="card-outline" label="Payment card" placeholder="Not set" />
      </View>

      <Text style={styles.sectionTitle}>MY CARS</Text>
      <View style={styles.card}>
        {carsPending ? (
          <View style={styles.emptyCars}>
            <ActivityIndicator color="#208AEF" />
          </View>
        ) : cars?.length ? (
          cars.map((car, index) => (
            <View key={car.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <CarRow
                car={car}
                busy={isCarBusy(car.id)}
                onEdit={() => router.push(`/cars/${car.id}`)}
                onSetDefault={() => setDefaultCar.mutate(car.id)}
                onDelete={() => confirmDeleteCar(car)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyCars}>
            <Ionicons name="car-outline" size={24} color="#9AA5B1" />
            <Text style={styles.emptyText}>
              {carsError ? "Couldn't load cars" : "No cars added yet"}
            </Text>
          </View>
        )}
        <View style={styles.divider} />
        {/* Счётчик и блокировка на лимите — чтобы не упереться в 403 уже после
            того, как форма заполнена. */}
        <Row
          icon="add-circle-outline"
          label="Add car"
          value={cars ? `${cars.length}/${CARS_LIMIT}` : undefined}
          onPress={() => router.push("/cars/new")}
          disabled={atCarsLimit}
        />
      </View>
    </ScrollView>
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
    gap: 12,
    padding: 24,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#4B5768",
    textAlign: "center",
  },
  retry: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#208AEF",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  container: {
    padding: 16,
    gap: 8,
  },
  header: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FF",
    overflow: "hidden",
  },
  avatarPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  pressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  avatarBusy: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  edit: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    paddingVertical: 3,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  editText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  tokens: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F4F7FF",
  },
  tokensText: {
    color: "#208AEF",
    fontWeight: "600",
    fontSize: 13,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2933",
  },
  hint: {
    color: "#9AA5B1",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#9AA5B1",
    letterSpacing: 0.5,
  },
  card: {
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
    color: "#1F2933",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rowValue: {
    color: "#9AA5B1",
    fontSize: 15,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  carRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  carInfo: {
    flex: 1,
    gap: 2,
  },
  carTitle: {
    fontSize: 16,
    color: "#1F2933",
  },
  carPlate: {
    fontSize: 13,
    color: "#9AA5B1",
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F4F7FF",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#208AEF",
    letterSpacing: 0.5,
  },
  rowPlaceholder: {
    color: "#DC2626",
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#D3DCE6",
    marginLeft: 48,
  },
  emptyCars: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 20,
  },
  emptyText: {
    color: "#9AA5B1",
  },
});
