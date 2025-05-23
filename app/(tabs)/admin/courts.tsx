import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { theme } from '@/constants/theme';
import { courts } from '@/constants/mockData';
import { Search, AlertTriangle, CheckCircle2, CircleOff } from 'lucide-react-native';

export default function CourtsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);

  const filteredCourts = courts.filter(court => 
    court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCourtStatus = (courtId: string) => {
    // TODO: Implement court status toggle
    console.log('Toggle court status:', courtId);
  };

  const setMaintenance = (courtId: string) => {
    // TODO: Implement maintenance mode
    console.log('Set maintenance:', courtId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un court..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterOption}>
          <Text style={styles.filterText}>Courts inactifs</Text>
          <Switch
            value={showInactiveOnly}
            onValueChange={setShowInactiveOnly}
            trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredCourts.map(court => (
          <View key={court.id} style={styles.courtCard}>
            <View style={styles.courtHeader}>
              <View>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtDescription}>{court.description}</Text>
              </View>
              {court.isActive ? (
                <CheckCircle2 size={20} color={theme.colors.success} />
              ) : (
                <CircleOff size={20} color={theme.colors.error} />
              )}
            </View>

            <View style={styles.courtDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Surface:</Text>
                <Text style={styles.detailValue}>{court.surface}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{court.indoor ? 'Intérieur' : 'Extérieur'}</Text>
              </View>
              {court.maintenanceReason && (
                <View style={styles.maintenanceAlert}>
                  <AlertTriangle size={16} color={theme.colors.secondary} />
                  <Text style={styles.maintenanceText}>{court.maintenanceReason}</Text>
                </View>
              )}
            </View>

            <View style={styles.features}>
              {court.features.map((feature, index) => (
                <View key={index} style={styles.featureTag}>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.maintenanceButton]}
                onPress={() => setMaintenance(court.id)}
              >
                <Text style={styles.actionButtonText}>Maintenance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  court.isActive ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => toggleCourtStatus(court.id)}
              >
                <Text style={styles.actionButtonText}>
                  {court.isActive ? 'Désactiver' : 'Activer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  courtCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courtName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  courtDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  courtDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    marginRight: theme.spacing.sm,
  },
  detailValue: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  maintenanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.secondary}15`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  maintenanceText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.xs,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  featureTag: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  featureText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.background,
  },
  maintenanceButton: {
    backgroundColor: theme.colors.secondary,
  },
  activateButton: {
    backgroundColor: theme.colors.success,
  },
  deactivateButton: {
    backgroundColor: theme.colors.error,
  },
});