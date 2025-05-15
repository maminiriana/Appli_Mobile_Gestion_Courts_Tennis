import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { theme } from '@/constants/theme';
import { bookings } from '@/constants/mockData';
import BookingItem from '@/components/BookingItem';
import Header from '@/components/Header';
import { useRouter } from 'expo-router';
import { Booking } from '@/types';

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  const currentDate = new Date();
  
  const upcomingBookings = bookings.filter(
    booking => booking.startTime > currentDate && booking.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(
    booking => booking.startTime <= currentDate || booking.status === 'cancelled'
  );

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleBookingPress = (booking: Booking) => {
    // In a real app, this would navigate to a booking detail page
    console.log('Booking pressed:', booking);
  };

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
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayedBookings.length > 0 ? (
          displayedBookings.map(booking => (
            <BookingItem 
              key={booking.id} 
              booking={booking} 
              onPress={handleBookingPress} 
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
    transition: 'transform 0.3s',
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
});