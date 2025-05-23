import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { courts, bookings } from '@/constants/mockData';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react-native';

// Mock statistics data
const mockStats = {
  totalBookings: 156,
  activeMembers: 84,
  averageBookingDuration: 1.5,
  mostPopularCourt: 'Court N°1',
  peakHours: '18:00 - 20:00',
  occupancyRate: 75,
  weeklyGrowth: 12,
  monthlyRevenue: 3200,
};

const timeRanges = ['Semaine', 'Mois', 'Année'] as const;
type TimeRange = typeof timeRanges[number];

export default function StatsScreen() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('Mois');

  const StatCard = ({ title, value, icon, suffix = '' }: {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    suffix?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon}
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>
        {value}{suffix}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistiques</Text>
        <View style={styles.timeRangeSelector}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.selectedTimeRange,
              ]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  selectedTimeRange === range && styles.selectedTimeRangeText,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Réservations"
          value={mockStats.totalBookings}
          icon={<Calendar size={24} color={theme.colors.primary} />}
        />
        <StatCard
          title="Membres actifs"
          value={mockStats.activeMembers}
          icon={<Users size={24} color={theme.colors.primary} />}
        />
        <StatCard
          title="Taux d'occupation"
          value={mockStats.occupancyRate}
          suffix="%"
          icon={<TrendingUp size={24} color={theme.colors.primary} />}
        />
        <StatCard
          title="Durée moyenne"
          value={mockStats.averageBookingDuration}
          suffix="h"
          icon={<Clock size={24} color={theme.colors.primary} />}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails des courts</Text>
        {courts.map((court) => {
          const courtBookings = bookings.filter(b => b.courtId === court.id);
          const occupancyRate = (courtBookings.length / 20) * 100; // Simplified calculation

          return (
            <View key={court.id} style={styles.courtStats}>
              <View style={styles.courtHeader}>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtOccupancy}>{Math.round(occupancyRate)}% occupé</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${occupancyRate}%` },
                    occupancyRate > 75 ? styles.highOccupancy :
                    occupancyRate > 50 ? styles.mediumOccupancy :
                    styles.lowOccupancy
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heures de pointe</Text>
        <View style={styles.peakHoursContainer}>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '80%' }]} />
            <Text style={styles.peakHourText}>8h</Text>
          </View>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '60%' }]} />
            <Text style={styles.peakHourText}>10h</Text>
          </View>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '40%' }]} />
            <Text style={styles.peakHourText}>12h</Text>
          </View>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '70%' }]} />
            <Text style={styles.peakHourText}>14h</Text>
          </View>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '90%' }]} />
            <Text style={styles.peakHourText}>16h</Text>
          </View>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '100%' }]} />
            <Text style={styles.peakHourText}>18h</Text>
          </View>
          <View style={styles.peakHourBar}>
            <View style={[styles.peakHourFill, { height: '85%' }]} />
            <Text style={styles.peakHourText}>20h</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenus</Text>
        <View style={styles.revenueInfo}>
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Ce mois</Text>
            <Text style={styles.revenueValue}>{mockStats.monthlyRevenue}€</Text>
            <Text style={styles.revenueGrowth}>+{mockStats.weeklyGrowth}%</Text>
          </View>
          <View style={styles.revenueSeparator} />
          <View style={styles.revenueItem}>
            <Text style={styles.revenueLabel}>Projection annuelle</Text>
            <Text style={styles.revenueValue}>{mockStats.monthlyRevenue * 12}€</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.pill,
    padding: 4,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.pill,
  },
  selectedTimeRange: {
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timeRangeText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  selectedTimeRangeText: {
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.sm,
  },
  statValue: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  section: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  courtStats: {
    marginBottom: theme.spacing.md,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  courtName: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  courtOccupancy: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.pill,
  },
  highOccupancy: {
    backgroundColor: theme.colors.error,
  },
  mediumOccupancy: {
    backgroundColor: theme.colors.secondary,
  },
  lowOccupancy: {
    backgroundColor: theme.colors.success,
  },
  peakHoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  peakHourBar: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  peakHourFill: {
    width: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  peakHourText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.xs,
  },
  revenueInfo: {
    flexDirection: 'row',
  },
  revenueItem: {
    flex: 1,
    alignItems: 'center',
  },
  revenueSeparator: {
    width: 1,
    backgroundColor: theme.colors.gray[200],
    marginHorizontal: theme.spacing.md,
  },
  revenueLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  revenueValue: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  revenueGrowth: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.success,
  },
});