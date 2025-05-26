import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { testConnection } from './test-connection';
import { theme } from '@/constants/theme';

export default function TestPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testConnection();
        setIsConnected(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        setIsConnected(false);
      }
    }

    checkConnection();
  }, []);

  return (
    <View style={styles.container}>
      {isConnected === null ? (
        <Text style={styles.text}>Test de connexion en cours...</Text>
      ) : isConnected ? (
        <Text style={styles.successText}>Connexion à Supabase réussie !</Text>
      ) : (
        <Text style={styles.errorText}>
          {error || 'Échec de la connexion à Supabase'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  text: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  successText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.success,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.error,
  },
});