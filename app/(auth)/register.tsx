import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, SafeAreaView, TouchableOpacity, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import Button from '../../components/Button';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async () => {
    if (isLoading) return;

    try {
      setError(null);
      setIsLoading(true);

      if (Platform.OS === 'web') {
        // Créer un input file invisible pour le web
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        // Promisify l'événement change
        const file = await new Promise<File>((resolve, reject) => {
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              resolve(file);
            } else {
              reject(new Error('Aucun fichier sélectionné'));
            }
          };
          input.click();
        });

        // Convertir le fichier en base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });

        setProfileImage(base64);
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          throw new Error('Permission d\'accès à la galerie refusée');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          setProfileImage(base64Image);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if email already exists
      const { data: existingUsers, error: queryError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .limit(1);

      if (queryError) {
        throw queryError;
      }

      if (existingUsers && existingUsers.length > 0) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          role: 'joueur',
          subscription_status: isPaid,
          last_subscription_date: isPaid ? new Date().toISOString() : null,
          profile_image: profileImage,
          password: hashedPassword
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Inscription</Text>
          <Text style={styles.subtitle}>Créez votre compte pour accéder à l'application</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo de profil</Text>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={handleImageUpload}
              disabled={isLoading}
            >
              <Text style={styles.uploadButtonText}>
                {profileImage ? 'Modifier la photo' : 'Uploader une photo'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Votre prénom"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Votre nom"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Numéro de téléphone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Votre numéro de téléphone"
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroupRow}>
            <Text style={styles.label}>Cotisation à jour</Text>
            <Switch
              value={isPaid}
              onValueChange={setIsPaid}
              trackColor={{ false: theme.colors.gray[400], true: theme.colors.primary }}
              thumbColor={isPaid ? theme.colors.primary : theme.colors.gray[100]}
              disabled={isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <Button
            title={isLoading ? "Inscription en cours..." : "S'inscrire"}
            onPress={handleRegister}
            style={styles.button}
            size="lg"
            disabled={isLoading}
          />
        </View>
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
    justifyContent: 'center',
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
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
    textAlign: 'center',
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
  inputGroupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
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
  uploadButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.white,
  },
});