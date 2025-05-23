import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Users, Tent as Tennis, Calendar, ChartBar as BarChart3 } from 'lucide-react-native';

export default function AdminScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: 'Gestion des membres',
      description: 'Gérer les comptes utilisateurs et les cotisations',
      icon: Users,
      route: '/admin/users',
    },
    {
      title: 'Gestion des courts',
      description: 'Gérer la disponibilité et la maintenance des courts',
      icon: Tennis,
      route: '/admin/courts',
    },
    {
      title: 'Gestion des réservations',
      description: 'Gérer les réservations des courts',
      icon: Calendar,
      route: '/admin/bookings',
    },
    {
      title: 'Statistiques',
      description: "Consulter les statistiques d'utilisation",
      icon: BarChart3,
      route: '/admin/stats',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Administration</Text>
        <Text style={styles.subtitle}>Gérez votre club de tennis</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
          >
            <View style={styles.cardInner}>
              <item.icon size={24} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
  },
  card: {
    width: '50%',
    padding: theme.spacing.sm,
  },
  cardInner: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  cardDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});