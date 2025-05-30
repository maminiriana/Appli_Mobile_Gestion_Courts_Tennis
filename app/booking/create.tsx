import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TextInput, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function CreateBookingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const courtId = params.courtId as string;
  const startTime = params.startTime ? new Date(params.startTime as string) : new Date();
  const endTime = params.endTime ? new Date(params.endTime as string) : new Date(Date.now() + 3600000);
  
  const handleConfirmBooking = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour effectuer une réservation');
      return;
    }

    try {
      setLoading(true);

      const { data: existingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('court_id', courtId)
        .eq('status', 'confirmed')
        .or(`start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()}`);

      if (checkError) throw checkError;

      if (existingBookings && existingBookings.length > 0) {
        Alert.alert('Erreur', 'Ce créneau n\'est plus disponible');
        return;
      }

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          court_id: courtId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (bookingError) throw bookingError;

      router.push({
        pathname: '/booking/confirmation',
        params: { courtId }
      });
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la réservation. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Finaliser la réservation',
          headerTitleStyle: {
            fontFamily: theme.fonts.semiBold,
            fontSize: theme.fontSizes.lg,
          },
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.bookingDetails}>
          <Text style={styles.sectionTitle}>Détails de la réservation</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {format(startTime, 'EEEE d MMMM yyyy', { locale: fr })}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Horaire</Text>
            <Text style={styles.infoValue}>
              {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
            </Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vos coordonnées</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <Text style={styles.userInfo}>
              {user?.first_name} {user?.last_name}
            </Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <Text style={styles.userInfo}>{user?.email}</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <Text style={styles.userInfo}>{user?.phone || 'Non renseigné'}</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Instructions particulières..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={loading ? "Réservation en cours..." : "Confirmer la réservation"}
          onPress={handleConfirmBooking}
          size="lg"
          disabled={loading}
        />
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
    paddingBottom: 100,
  },
  bookingDetails: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  infoLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  infoValue: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[700],
  },
  formSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  userInfo: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
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
  textArea: {
    height: 100,
    paddingTop: theme.spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
});