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
  Alert 
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

export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState<string>(user?.firstName || '');
  const [lastName, setLastName] = useState<string>(user?.lastName || '');
  const [phone, setPhone] = useState<string>(user?.phoneNumber || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async () => {
    if (isLoading) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setError('Permission d\'accès à la galerie refusée');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!pickerResult.canceled) {
      try {
        setError(null);
        setIsLoading(true);
        
        const asset = pickerResult.assets[0];
        const fileName = `${Date.now()}_${asset.fileName || 'profile'}.jpg`;
        
        // Convertir l'image en base64
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
        
        // Uploader l'image vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, base64, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique de l'image
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);

        setProfileImage(publicUrl);
        Alert.alert('Succès', 'Photo de profil mise à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'upload de l\'image:', error);
        setError('Erreur lors de l\'upload de l\'image');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation des champs
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Mettre à jour les informations de l'utilisateur
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone,
          profile_image: profileImage || user.profileImage,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Mettre à jour le contexte
      setUser({
        ...user,
        firstName,
        lastName,
        phoneNumber: phone,
        profileImage: profileImage || user.profileImage,
      } as User);

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setError('Erreur lors de la mise à jour du profil');
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
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderText}>Aucune photo</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImageUpload}
              disabled={isLoading}
            >
              <Text style={styles.uploadButtonText}>
                {isLoading ? 'Chargement...' : 'Modifier la photo'}
              </Text>
            </TouchableOpacity>
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
              disabled={isLoading}
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.md,
  },
  placeholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[500],
  },
  uploadButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  uploadButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: 'white',
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
  disabledButton: {
    backgroundColor: theme.colors.gray[300],
  },
  saveButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: 'white',
  },
});
