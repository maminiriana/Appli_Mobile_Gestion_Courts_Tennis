import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, UserCheck, UserX } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function UsersManagementScreen() {
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

  const toggleAdminRole = async (email: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'joueur' : 'admin';
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('email', email);

      if (error) throw error;

      // Refresh the users list after update
      await fetchUsers();
      
      Alert.alert(
        'Succès',
        `L'utilisateur est maintenant ${newRole === 'admin' ? 'administrateur' : 'joueur'}`
      );
    } catch (err) {
      console.error('Error updating role:', err);
      Alert.alert('Erreur', 'Impossible de modifier le rôle de l\'utilisateur');
    }
  };

  if (loading) {
    return <Text>Chargement...</Text>;
  }

  if (error) {
    return <Text>Erreur: {error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {users.map(user => (
        <View key={user.id} style={styles.userCard}>
          <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>Rôle actuel: {user.role}</Text>
          
          <TouchableOpacity
            style={[
              styles.roleButton,
              user.role === 'admin' ? styles.removeAdminButton : styles.makeAdminButton
            ]}
            onPress={() => toggleAdminRole(user.email, user.role)}
          >
            <Text style={styles.buttonText}>
              {user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.gray[100],
  },
  userCard: {
    backgroundColor: theme.colors.background,
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: theme.colors.gray[600],
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: theme.colors.gray[500],
    marginBottom: 8,
  },
  roleButton: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  makeAdminButton: {
    backgroundColor: theme.colors.primary,
  },
  removeAdminButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
});