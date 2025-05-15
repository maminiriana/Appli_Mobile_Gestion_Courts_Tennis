import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { courts } from '@/constants/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CreateBookingScreen() {
  const router = useRouter();
  const [name, setName] = useState('Jean Dupont');
  const [email, setEmail] = useState('user@example.com');
  const [phone, setPhone] = useState('06 12 34 56 78');
  const [notes, setNotes] = useState('');
  
  // In a real app, these would come from route params or a global state
  const selectedCourt = courts[0];
  const bookingDate = new Date();
  const startTime = new Date(new Date().setHours(10, 0, 0, 0));
  const endTime = new Date(new Date().setHours(11, 0, 0, 0));
  const price = 25;
  
  const handleConfirmBooking = () => {
    // In a real app, this would send the booking data to a server
    router.push('/booking/confirmation');
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
            <Text style={styles.infoLabel}>Court</Text>
            <Text style={styles.infoValue}>{selectedCourt.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {format(bookingDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Horaire</Text>
            <Text style={styles.infoValue}>
              {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prix</Text>
            <Text style={styles.infoValue}>{price}€</Text>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vos coordonnées</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Votre email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Votre numéro de téléphone"
              keyboardType="phone-pad"
            />
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
        
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Paiement</Text>
          <Text style={styles.paymentInfo}>
            Le paiement sera effectué sur place. Vous pouvez annuler votre réservation jusqu'à 24 heures avant l'heure prévue.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.totalPrice}>Total: {price}€</Text>
        <Button
          title="Confirmer la réservation"
          onPress={handleConfirmBooking}
          size="lg"
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
  paymentSection: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  paymentInfo: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[700],
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  totalPrice: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary,
    marginRight: theme.spacing.md,
  },
});