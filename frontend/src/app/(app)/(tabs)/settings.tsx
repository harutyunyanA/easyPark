import { useSession } from "@/providers/auth";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

// Заглушка настроек приложения. Реальный контент (уведомления, язык, тема) — позже.
// Пока держим здесь рабочий Log out, чтобы было чем разлогиниться при тестах.
export default function SettingsScreen() {
  const { signOut } = useSession();

  return (
    <View style={styles.screen}>
      <View style={styles.placeholder}>
        <Ionicons name="settings-outline" size={40} color="#9AA5B1" />
        <Text style={styles.placeholderText}>Settings — coming soon</Text>
      </View>

      <Pressable style={styles.logout} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#9AA5B1",
    fontWeight: "500",
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  logoutText: {
    color: "#DC2626",
    fontWeight: "600",
  },
});
