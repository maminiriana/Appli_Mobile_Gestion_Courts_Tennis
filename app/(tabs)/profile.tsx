import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import Header from '../../components/Header';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronRight, CreditCard as Edit2, LogOut, CreditCard, Bell, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, setUser, setToken } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    router.replace('/');
  };

  const handleEditProfile = () => {
    router.push('/(tabs)/edit-profile');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Mon profil" />
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Vous devez être connecté pour voir cette page.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mon profil" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          {user.profile_image ? (
            <Image 
              source={{ uri: user.profile_image }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImagePlaceholderText}>
                {user.first_name?.charAt(0) || user.email.charAt(0)}
              </Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
            <Text style={styles.membershipTag}>
              {user.subscription_status ? 'Membre actif' : 'Membre inactif'}
            </Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit2 size={14} color={theme.colors.primary} />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Téléphone</Text>
            <Text style={styles.infoValue}>{user.phone || 'Non renseigné'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Membre depuis</Text>
            <Text style={styles.infoValue}>
              {user.created_at ? format(new Date(user.created_at), 'MMMM yyyy', { locale: fr }) : 'Non renseigné'}
            </Text>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Paramètres</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <CreditCard size={20} color={theme.colors.gray[600]} />
            <Text style={styles.menuItemText}>Moyens de paiement</Text>
            <ChevronRight size={18} color={theme.colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Bell size={20} color={theme.colors.gray[600]} />
            <Text style={styles.menuItemText}>Notifications</Text>
            <ChevronRight size={18} color={theme.colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <HelpCircle size={20} color={theme.colors.gray[600]} />
            <Text style={styles.menuItemText}>Aide et support</Text>
            <ChevronRight size={18} color={theme.colors.gray[400]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
            <LogOut size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
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
    paddingVertical: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: theme.colors.background,
    fontSize: 32,
    fontFamily: theme.fonts.bold,
  },
  profileInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
    marginBottom: 4,
  },
  membershipTag: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    marginLeft: 4,
  },
  infoSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoItem: {
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  menuSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  menuItemText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.error,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
});
