import { Stack } from 'expo-router';

export default function AppLayout() {
  // Пока Stack. Когда появится несколько экранов — заменим на табы.
  return <Stack screenOptions={{ headerShown: false }} />;
}
