import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { theme } from '@/constants/theme';
import BookingItem from '@/components/BookingItem';
import Header from '@/components/Header';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';

export default function BookingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch bookings for the current user
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          courts (
            id,
            name,
            surface,
            indoor,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des réservations');
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentDate = new Date();
  
  const upcomingBookings = bookings.filter(booking => {
    const startTime = new Date(booking.start_time);
    return startTime > currentDate && booking.status !== 'cancelled';
  });
  
  const pastBookings = bookings.filter(booking => {
    const startTime = new Date(booking.start_time);
    return startTime <= currentDate || booking.status === 'cancelled';
  });

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleBookingPress = (booking) => {
    // Navigate to booking detail page
    router.push(`/booking/${booking.id}`);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Mes réservations" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Vous devez être connecté pour voir vos réservations</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mes réservations" />
      
      <View style={styles.tabContainer}>
        <View 
          style={[
            styles.tabSelector, 
            { transform: [{ translateX: activeTab === 'upcoming' ? 0 : 150 }] }
          ]} 
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          À venir
        </Text>
        <Text
          style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}
          onPress={() => setActiveTab('past')}
        >
          Historique
        </Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Chargement de vos réservations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {displayedBookings.length > 0 ? (
            displayedBookings.map(booking => (
              <BookingItem 
                key={booking.id} 
                booking={booking}
                court={booking.courts}
                onPress={() => handleBookingPress(booking)} 
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'upcoming' 
                  ? "Vous n'avez pas de réservations à venir." 
                  : "Vous n'avez pas encore effectué de réservation."
                }
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    height: 50,
    position: 'relative',
    paddingHorizontal: theme.spacing.md,
  },
  tabSelector: {
    position: 'absolute',
    bottom: 0,
    left: theme.spacing.md,
    width: 120,
    height: 3,
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[500],
    paddingVertical: 12,
  },
  activeTabText: {
    color: theme.colors.text,
    fontFamily: theme.fonts.semiBold,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.md,
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
  },
});