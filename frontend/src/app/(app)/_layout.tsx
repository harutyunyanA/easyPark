import { Stack } from 'expo-router';

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
    </Stack>
  );
}
