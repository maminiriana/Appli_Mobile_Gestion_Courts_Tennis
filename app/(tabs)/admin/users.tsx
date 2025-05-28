import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, UserCheck, UserX, Shield } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function UsersManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_name');

      if (error) throw error;

      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          subscription_status: !currentStatus,
          last_subscription_date: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message);
    }
  };

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'joueur' : 'admin';
      
      // Show confirmation dialog
      Alert.alert(
        'Confirmation',
        `Êtes-vous sûr de vouloir ${newRole === 'admin' ? 'promouvoir' : 'rétrograder'} cet utilisateur ?`,
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Confirmer',
            onPress: async () => {
              const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

              if (error) throw error;

              await fetchUsers();
            },
          },
        ],
      );
    } catch (err) {
      console.error('Error toggling admin role:', err);
      setError(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showActiveOnly) {
      return matchesSearch && user.subscription_status;
    }
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
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
                <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleContainer}>
                  <Shield size={16} color={user.role === 'admin' ? theme.colors.primary : theme.colors.gray[500]} />
                  <Text style={[
                    styles.roleText,
                    user.role === 'admin' && styles.adminRoleText
                  ]}>
                    {user.role === 'admin' ? 'Administrateur' : 'Joueur'}
                  </Text>
                </View>
              </View>
              {user.subscription_status ? (
                <UserCheck size={20} color={theme.colors.success} />
              ) : (
                <UserX size={20} color={theme.colors.error} />
              )}
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userPhone}>{user.phone || 'Aucun numéro'}</Text>
              <Text style={styles.subscriptionDate}>
                Dernière cotisation: {user.last_subscription_date 
                  ? format(new Date(user.last_subscription_date), 'dd/MM/yyyy')
                  : 'Jamais'}
              </Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.roleButton]}
                onPress={() => toggleAdminRole(user.id, user.role)}
              >
                <Text style={styles.actionButtonText}>
                  {user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  user.subscription_status ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => toggleUserStatus(user.id, user.subscription_status)}
              >
                <Text style={styles.actionButtonText}>
                  {user.subscription_status ? 'Désactiver' : 'Activer'}
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
    alignItems: 'flex-start',
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  adminRoleText: {
    color: theme.colors.primary,
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
  roleButton: {
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