import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

// Заглушка. По задумке поиск — модалка снизу-вверх (адрес / названия мест); сделаем позже.
export default function ExploreScreen() {
  return (
    <View style={styles.center}>
      <Ionicons name="search-outline" size={40} color="#9AA5B1" />
      <Text style={styles.text}>Search — coming soon</Text>
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
