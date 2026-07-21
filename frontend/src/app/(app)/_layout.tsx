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
    </Stack>
  );
}
