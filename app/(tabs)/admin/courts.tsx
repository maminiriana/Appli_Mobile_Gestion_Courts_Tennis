import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, CircleOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function CourtsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name');

      if (error) throw error;

      setCourts(data);
    } catch (err) {
      console.error('Error fetching courts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourtStatus = async (courtId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courts')
        .update({ is_active: !currentStatus })
        .eq('id', courtId);

      if (error) throw error;

      await fetchCourts();
    } catch (err) {
      console.error('Error toggling court status:', err);
      setError(err.message);
    }
  };

  const setMaintenance = async (courtId: string) => {
    // Implement maintenance logic here
    console.log('Set maintenance:', courtId);
  };

  const filteredCourts = courts.filter(court => 
    (court.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.surface?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!showInactiveOnly || !court.is_active)
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des courts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

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
              {court.is_active ? (
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
            </View>

            <View style={styles.features}>
              {court.features && Array.isArray(court.features) && court.features.map((feature, index) => (
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
                  court.is_active ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => toggleCourtStatus(court.id, court.is_active)}
              >
                <Text style={styles.actionButtonText}>
                  {court.is_active ? 'Désactiver' : 'Activer'}
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
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});