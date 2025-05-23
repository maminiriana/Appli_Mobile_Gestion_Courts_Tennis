import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, UserCheck, UserX } from 'lucide-react-native';
import { TextInput } from 'react-native';

// Mock data for development
const mockUsers = [
  {
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '06 12 34 56 78',
    subscriptionStatus: true,
    lastSubscriptionDate: '2024-01-15',
  },
  {
    id: '2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@email.com',
    phone: '06 23 45 67 89',
    subscriptionStatus: false,
    lastSubscriptionDate: '2023-12-31',
  },
];

export default function UsersManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showActiveOnly) {
      return matchesSearch && user.subscriptionStatus;
    }
    
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un membre..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterActive(!filterActive)}
        >
          <Filter size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {filterActive && (
        <View style={styles.filterSection}>
          <View style={styles.filterOption}>
            <Text style={styles.filterText}>Afficher uniquement les membres actifs</Text>
            <Switch
              value={showActiveOnly}
              onValueChange={setShowActiveOnly}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
            />
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <View>
                <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              {user.subscriptionStatus ? (
                <UserCheck size={20} color={theme.colors.success} />
              ) : (
                <UserX size={20} color={theme.colors.error} />
              )}
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userPhone}>{user.phone}</Text>
              <Text style={styles.subscriptionDate}>
                Dernière cotisation: {new Date(user.lastSubscriptionDate).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => {/* TODO: Implement edit */}}
              >
                <Text style={styles.actionButtonText}>Modifier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, user.subscriptionStatus ? styles.deactivateButton : styles.activateButton]}
                onPress={() => {/* TODO: Implement status toggle */}}
              >
                <Text style={styles.actionButtonText}>
                  {user.subscriptionStatus ? 'Désactiver' : 'Activer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {/* TODO: Implement new user creation */}}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
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
  filterButton: {
    padding: theme.spacing.sm,
  },
  filterSection: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  userName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  userEmail: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  userDetails: {
    marginBottom: theme.spacing.md,
  },
  userPhone: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  subscriptionDate: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginTop: 4,
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
  editButton: {
    backgroundColor: theme.colors.primary,
  },
  activateButton: {
    backgroundColor: theme.colors.success,
  },
  deactivateButton: {
    backgroundColor: theme.colors.error,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 24,
    color: theme.colors.background,
    fontFamily: theme.fonts.medium,
  },
});