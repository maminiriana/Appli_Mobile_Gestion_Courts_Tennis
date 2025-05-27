import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  Alert,
  Platform 
} from 'react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabase';
import * as ImagePicker from 'expo-image-picker';
import { User } from '../../types/supabase';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import Button from '../../components/Button';
import { Camera, Upload } from 'lucide-react-native';

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>(user?.first_name || '');
  const [lastName, setLastName] = useState<string>(user?.last_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile_image || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleImageUpload = async () => {
    if (isLoading || isUploading) return;

    try {
      setError(null);
      setIsUploading(true);

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

        // Upload vers Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('profile-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        setProfileImage(publicUrl);

      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          throw new Error('Permission d\'accès à la galerie refusée');
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });

        if (!pickerResult.canceled) {
          const asset = pickerResult.assets[0];
          
          // Convertir l'URI en base64
          const base64 = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Upload vers Supabase Storage
          const fileName = `${Date.now()}.jpg`;
          const { error: uploadError, data } = await supabase.storage
            .from('profile-images')
            .upload(fileName, decode(base64), {
              contentType: 'image/jpeg',
            });

          if (uploadError) throw uploadError;

          // Obtenir l'URL publique
          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);

          setProfileImage(publicUrl);
        }
      }

      Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!firstName.trim() || !lastName.trim()) {
      setError('Le nom et le prénom sont obligatoires');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          profile_image: profileImage,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUser({
        ...user,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        profile_image: profileImage,
      } as User);

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.profileImageContainer}>
            <TouchableOpacity 
              style={styles.imageWrapper}
              onPress={handleImageUpload}
              disabled={isUploading}
            >
              {profileImage ? (
                <>
                  <Image
                    source={{ uri: profileImage }}
                    style={styles.profileImage}
                  />
                  <View style={styles.uploadOverlay}>
                    <Upload size={24} color={theme.colors.background} />
                  </View>
                </>
              ) : (
                <View style={styles.placeholder}>
                  <Camera size={40} color={theme.colors.gray[400]} />
                </View>
              )}
              {isUploading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color={theme.colors.background} size="large" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.uploadText}>
              {isUploading ? 'Chargement...' : 'Modifier la photo'}
            </Text>
          </View>

          <View style={styles.form}>
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
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Votre numéro de téléphone"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>

            <Button
              title={isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              onPress={handleSave}
              style={styles.saveButton}
              size="lg"
              disabled={isLoading || isUploading}
            />
          </View>
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xl,
  },
  errorContainer: {
    backgroundColor: `${theme.colors.error}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.error,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  uploadText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
  },
  form: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
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
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
});