import { useMe } from "@/api/auth";
import { getApiErrorMessage } from "@/lib/api-error";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { type ComponentProps } from "react";
import {
  ActivityIndicator,
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
}: {
  icon: IconName;
  label: string;
  value?: string;
  // Показывается красным, когда value пустой — значит поле ещё не заполнено.
  placeholder?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
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

export default function ProfileScreen() {
  const { data: me, isPending, isError, error, refetch } = useMe();

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
          {/* TODO: онтап — выбор/смена фото профиля */}
          <Pressable style={styles.avatarPressable} onPress={() => {}}>
            {me.avatarURL ? (
              <Image
                source={{ uri: me.avatarURL }}
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
        <Row icon="person-outline" label="Name" value={me.name} />
        <View style={styles.divider} />
        <Row
          icon="call-outline"
          label="Phone"
          value={me.phone ?? undefined}
          placeholder="Not set"
        />
      </View>

      <Text style={styles.sectionTitle}>PAYMENT</Text>
      <View style={styles.card}>
        <Row icon="card-outline" label="Payment card" placeholder="Not set" />
      </View>

      <Text style={styles.sectionTitle}>MY CARS</Text>
      <View style={styles.card}>
        <View style={styles.emptyCars}>
          <Ionicons name="car-outline" size={24} color="#9AA5B1" />
          <Text style={styles.emptyText}>No cars added yet</Text>
        </View>
        <View style={styles.divider} />
        <Row icon="add-circle-outline" label="Add car" />
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
