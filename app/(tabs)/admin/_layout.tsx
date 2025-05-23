import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { View, Text } from 'react-native';

export default function AdminLayout() {
  const { user } = useAuth();

  // Vérifier si l'utilisateur est un administrateur
  if (!user || user.role !== 'ADMIN') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Accès non autorisé</Text>
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