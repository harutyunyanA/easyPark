import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useCarBrands } from "@/api/cars";
import { getApiErrorMessage } from "@/lib/api-error";
import { type CarBrand } from "@/types/car.types";

// Выбор бренда живёт в модалке, а не на отдельном роуте: expo-router не умеет
// возвращать значение с pushed-экрана, пришлось бы городить контекст ради
// одного поля. Модалка внутри формы — стейт формы вообще не размонтируется.
export function BrandPickerModal({
  visible,
  selectedId,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selectedId: number | null;
  onSelect: (brand: CarBrand) => void;
  onClose: () => void;
}) {
  const { data: brands, isPending, isError, error, refetch } = useCarBrands();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return brands ?? [];
    return (brands ?? []).filter((brand) =>
      brand.name.toLowerCase().includes(needle),
    );
  }, [brands, query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Select brand</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel="Close brand picker"
          >
            <Ionicons name="close" size={24} color="#4B5768" />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color="#9AA5B1" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor="#9AA5B1"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#9AA5B1" />
            </Pressable>
          ) : null}
        </View>

        {isPending ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#208AEF" />
          </View>
        ) : isError ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              {getApiErrorMessage(error, "Couldn't load brands.")}
            </Text>
            <Pressable style={styles.retry} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(brand) => String(brand.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            ListEmptyComponent={
              <Text style={styles.empty}>Nothing found for “{query}”.</Text>
            }
            renderItem={({ item }) => (
              <Pressable style={styles.row} onPress={() => onSelect(item)}>
                <Text style={styles.rowText}>{item.name}</Text>
                {item.id === selectedId ? (
                  <Ionicons name="checkmark" size={20} color="#208AEF" />
                ) : null}
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2933",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D3DCE6",
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1F2933",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
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
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    fontSize: 16,
    color: "#1F2933",
  },
  divider: {
    height: 1,
    marginLeft: 16,
    backgroundColor: "#EDF0F4",
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: "#9AA5B1",
  },
});
