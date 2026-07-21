import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/providers/auth';

export default function HomeScreen() {
  const { signOut } = useSession();

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>easyPark — home (protected)</Text>
      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Выйти</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 18,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#208AEF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
