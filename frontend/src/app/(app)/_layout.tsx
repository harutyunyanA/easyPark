import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

// Модалка выезжает снизу и на iOS закрывается свайпом, но на Android жеста нет —
// без своей кнопки из неё было бы не выйти.
function CancelButton() {
  return (
    <Pressable onPress={() => router.back()} hitSlop={12}>
      <Text style={styles.cancel}>Cancel</Text>
    </Pressable>
  );
}

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      {/* Профиль открывается поверх табов (по тапу на аватар), поэтому не таб, а push-экран. */}
      <Stack.Screen
        name="profile"
        options={{ headerShown: true, title: 'Profile' }}
      />
      {/* edit/ без своего _layout — роуты плющатся в этот стек как edit/name и edit/phone. */}
      <Stack.Screen
        name="edit/name"
        options={{ headerShown: true, title: 'Edit Name' }}
      />
      <Stack.Screen
        name="edit/phone"
        options={{ headerShown: true, title: 'Edit Phone' }}
      />
      {/* Добавление машины — создание сущности, а не правка поля: показываем
          модалкой, чтобы свайп вниз читался как отмена. */}
      <Stack.Screen
        name="cars/new"
        options={{
          headerShown: true,
          title: 'Add car',
          presentation: 'modal',
          headerLeft: () => <CancelButton />,
        }}
      />
      {/* Правка существующей машины — обычный push, как edit/name: сущность уже
          есть, отменять нечего, работает штатная кнопка "назад". */}
      <Stack.Screen
        name="cars/[id]"
        options={{ headerShown: true, title: 'Edit car' }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  cancel: {
    fontSize: 16,
    color: '#208AEF',
  },
});
