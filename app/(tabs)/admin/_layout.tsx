import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export default function AdminLayout() {
  const { user } = useAuth();

  // Vérifier si l'utilisateur est un administrateur
  if (!user || user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès non autorisé</Text>
        <Text style={styles.message}>
          Cette section est réservée aux administrateurs.
        </Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Administration',
        }}
      />
      <Stack.Screen
        name="users"
        options={{
          title: 'Gestion des membres',
        }}
      />
      <Stack.Screen
        name="courts"
        options={{
          title: 'Gestion des courts',
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: 'Gestion des réservations',
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: 'Statistiques',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});