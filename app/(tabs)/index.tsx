import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TextInput, Image, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { courts, timeSlots } from '../../constants/mockData';
import CourtItem from '../../components/CourtItem';
import DatePicker from '../../components/DatePicker';
import { useRouter } from 'expo-router';
import { Search, Filter } from 'lucide-react-native';
import Button from '../../components/Button';
import { useAuth } from '../context/AuthContext';

import type { Court } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const filteredCourts = courts.filter((court: Court) => 
    court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    court.surface.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Tennis Court Manager</Text>
            <Text style={styles.subtitle}>Réservez votre court de tennis</Text>
          </View>
          <View style={styles.headerButtonsContainer}>
            {!user ? (
              <>
                <Button
                  title="Se connecter"
                  onPress={() => router.push('/(auth)/login')}
                  style={{ marginRight: 8 }}
                />
                <Button
                  title="S'inscrire"
                  onPress={() => router.push('/(auth)/register')}
                />
              </>
            ) : (
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                {user.profile_image ? (
                  <Image
                    source={{ uri: user.profile_image }}
                    style={styles.userIcon}
                  />
                ) : (
                  <View style={styles.userIconPlaceholder}>
                    <Text style={styles.userIconText}>
                      {user.first_name ? user.first_name.charAt(0) : 'U'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
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
          {filteredCourts.length > 0 ? (
            filteredCourts.map((court: Court) => (
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerButtonsContainer: {
    flexDirection: 'row',
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
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
  noResults: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});