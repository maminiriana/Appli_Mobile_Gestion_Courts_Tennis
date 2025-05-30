import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { theme } from '../../constants/theme';
import CourtItem from '../../components/CourtItem';
import DatePicker from '../../components/DatePicker';
import { useRouter } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import Button from '../../components/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    
    fetchCourts();
  }, [user]);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('courts')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;
      setCourts(data);
    } catch (err) {
      console.error('Erreur lors de la récupération des courts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const filteredCourts = courts.filter(court => 
    court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.surface.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Tennis Court Manager</Text>
          <Text style={styles.subtitle}>Réservez votre court de tennis</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Search size={20} color={theme.colors.gray[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un court..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={theme.colors.gray[500]}
            />
          </View>
          <Button
            title="Filtres"
            variant="outline"
            size="sm"
            style={styles.filterButton}
            icon={<Filter size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />}
            onPress={() => {}}
          />
        </View>

        <DatePicker 
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <View style={styles.courtsSection}>
          <Text style={styles.sectionTitle}>Courts disponibles</Text>
          {loading ? (
            <Text style={styles.loadingText}>Chargement des courts...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : filteredCourts.length > 0 ? (
            filteredCourts.map((court) => (
              <CourtItem key={court.id} court={court} />
            ))
          ) : (
            <Text style={styles.noResults}>Aucun court ne correspond à votre recherche</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xxxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  filterButton: {
    height: 44,
  },
  courtsSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  noResults: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});