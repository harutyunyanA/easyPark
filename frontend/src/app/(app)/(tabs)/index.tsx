import { useMe } from "@/api/auth";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Тот же кэш ["me"], что и в профиле — второй вызов запрос не дублирует.
  const { data: me } = useMe();

  return (
    <View style={styles.screen}>
      {/* Заглушка карты. Настоящая карта (expo-maps) требует dev build и на web
          не рендерится — прикрутим отдельным заходом. */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color="#9AA5B1" />
        <Text style={styles.placeholderText}>Map goes here</Text>
      </View>

      {/* Аватар поверх карты, сверху-слева → профиль */}
      <Pressable
        style={[styles.avatar, { top: insets.top + 12 }]}
        onPress={() => router.push("/profile")}
        hitSlop={8}
      >
        {me?.avatarURL ? (
          <Image
            source={{ uri: me.avatarURL }}
            style={styles.avatarImage}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="person" size={22} color="#208AEF" />
        )}
      </Pressable>

      {/* TODO: кнопка "Offer spot" в правом нижнем углу — после профиля */}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EEF1F5",
  },
  placeholderText: {
    color: "#9AA5B1",
    fontWeight: "500",
  },
  avatar: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});
