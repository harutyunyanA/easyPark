import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Заглушка. Что тут будет (мои сделки / история парковок / кошелёк) — решим позже.
export default function ActivityScreen() {
  return (
    <View style={styles.center}>
      <Ionicons name="time-outline" size={40} color="#9AA5B1" />
      <Text style={styles.text}>Activity — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
  },
  text: {
    color: "#9AA5B1",
    fontWeight: "500",
  },
});
