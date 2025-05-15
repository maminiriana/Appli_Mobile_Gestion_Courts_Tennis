import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Administration',
        }}
      />
      <Stack.Screen
        name="members"
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
        name="stats"
        options={{
          title: 'Statistiques',
        }}
      />
    </Stack>
  );
}