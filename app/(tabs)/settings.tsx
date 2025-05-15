import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, ScrollView, SafeAreaView } from 'react-native';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import { Bell, Globe, Moon, Volume2, Eye, Shield } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [language, setLanguage] = useState('Français');
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Paramètres" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Notifications push</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Notifications email</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Moon size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Mode sombre</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Volume2 size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Sons</Text>
            </View>
            <Switch
              value={sounds}
              onValueChange={setSounds}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Globe size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Langue</Text>
            </View>
            <Text style={styles.settingValue}>{language}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Eye size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Visibilité du profil</Text>
            </View>
            <Text style={styles.settingValue}>Membres</Text>
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Shield size={20} color={theme.colors.gray[600]} />
              <Text style={styles.settingText}>Sécurité du compte</Text>
            </View>
            <Text style={styles.settingValue}>Gérer</Text>
          </View>
        </View>
        
        <View style={styles.appInfoSection}>
          <Text style={styles.appVersion}>Version de l'application: 1.0.0</Text>
          <Text style={styles.appInfo}>Tennis Court Manager © 2025</Text>
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
  section: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  settingValue: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
  },
  appInfoSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  appVersion: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  appInfo: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.xs,
    color: theme.colors.gray[500],
  },
});