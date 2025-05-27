import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView } from 'react-native';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setError('Token de réinitialisation invalide');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('password_resets')
        .select('*')
        .eq('token', token)
        .single();

      if (error || !data) {
        throw new Error('Token invalide ou expiré');
      }

      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('Le token a expiré');
      }

      setIsValid(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Token invalide');
      setIsValid(false);
    }
  };

  const handleResetPassword = async () => {
    if (!isValid) {
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data: resetData, error: resetError } = await supabase
        .from('password_resets')
        .select('user_id')
        .eq('token', token)
        .single();

      if (resetError || !resetData) {
        throw new Error('Token invalide');
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', resetData.user_id);

      if (updateError) {
        throw updateError;
      }

      // Mark token as used
      await supabase
        .from('password_resets')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValid && error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retour à la connexion"
              onPress={() => router.replace('/login')}
              style={styles.button}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Réinitialiser le mot de passe</Text>
          <Text style={styles.subtitle}>
            Choisissez un nouveau mot de passe pour votre compte
          </Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>Mot de passe modifié !</Text>
            <Text style={styles.successText}>
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </Text>
            <Button
              title="Se connecter"
              onPress={() => router.replace('/login')}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={theme.colors.gray[500]} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={theme.colors.gray[500]} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="new-password"
                  editable={!isLoading}
                />
              </View>
            </View>

            <Button
              title={isLoading ? "Modification en cours..." : "Modifier le mot de passe"}
              onPress={handleResetPassword}
              style={styles.button}
              size="lg"
              disabled={isLoading}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  content: {
    padding: theme.spacing.md,
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.xl,
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
  form: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.error}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
  },
  successContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
  },
  successText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});