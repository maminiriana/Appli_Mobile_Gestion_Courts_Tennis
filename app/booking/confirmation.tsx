import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Image } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '@/constants/theme';
import Button from '@/components/Button';
import { CircleCheck as CheckCircle, Calendar, Clock, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const bookingId = 'TCM-' + Math.floor(100000 + Math.random() * 900000);
  const bookingDate = new Date();
  const startTime = new Date(new Date().setHours(10, 0, 0, 0));
  const endTime = new Date(new Date().setHours(11, 0, 0, 0));

  useEffect(() => {
    fetchCourtDetails();
  }, [params.courtId]);

  const fetchCourtDetails = async () => {
    if (!params.courtId) return;

    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', params.courtId)
        .single();

      if (error) throw error;
      setCourt(data);
    } catch (err) {
      console.error('Error fetching court details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewBookings = () => {
    router.push('/bookings');
  };
  
  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !court) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Une erreur est survenue lors du chargement des détails de la réservation
          </Text>
          <Button title="Retour à l'accueil" onPress={handleBackToHome} />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Confirmation',
          headerTitleStyle: {
            fontFamily: theme.fonts.semiBold,
            fontSize: theme.fontSizes.lg,
          },
        }}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successContainer}>
          <View style={styles.checkCircle}>
            <CheckCircle size={40} color={theme.colors.background} />
          </View>
          <Text style={styles.successTitle}>Réservation confirmée !</Text>
          <Text style={styles.successMessage}>
            Votre réservation a été effectuée avec succès. Un email de confirmation vous a été envoyé.
          </Text>
        </View>
        
        <View style={styles.bookingDetails}>
          <Text style={styles.bookingId}>Réservation #{bookingId}</Text>
          
          <View style={styles.courtInfo}>
            <Image 
              source={{ 
                uri: court.image_url || 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg'
              }} 
              style={styles.courtImage} 
            />
            <View style={styles.courtDetails}>
              <Text style={styles.courtName}>{court.name}</Text>
              <Text style={styles.courtSurface}>{court.surface}</Text>
            </View>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Calendar size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>
                {format(bookingDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Clock size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <MapPin size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>
                {court.indoor ? 'Court intérieur' : 'Court extérieur'}
              </Text>
            </View>
          </View>
          
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Paiement sur place</Text>
            <Text style={styles.paymentText}>
              Merci de prévoir un paiement par carte bancaire ou en espèces à votre arrivée.
            </Text>
          </View>
        </View>
        
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderTitle}>Rappel important</Text>
          <Text style={styles.reminderText}>
            Veuillez arriver 15 minutes avant votre heure de réservation. Les annulations sont gratuites jusqu'à 24 heures avant l'heure prévue.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Voir mes réservations"
          onPress={handleViewBookings}
          size="lg"
          style={styles.viewBookingsButton}
        />
        <Button
          title="Retour à l'accueil"
          onPress={handleBackToHome}
          size="lg"
          variant="outline"
          style={styles.homeButton}
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
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  successTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  successMessage: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
    maxWidth: '80%',
  },
  bookingDetails: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingId: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
  },
  courtInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
  },
  courtImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
  },
  courtDetails: {
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  courtName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  courtSurface: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  detailsContainer: {
    marginBottom: theme.spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  paymentInfo: {
    backgroundColor: `${theme.colors.secondary}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  paymentTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.secondary,
    marginBottom: 4,
  },
  paymentText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  reminderContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    shadowColor: theme.colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  reminderText: {
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  viewBookingsButton: {
    marginBottom: theme.spacing.sm,
  },
  homeButton: {
  },
});