import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { ChevronLeft, MapPin, DoorClosed, CircleCheck as CheckCircle } from 'lucide-react-native';
import DatePicker from '@/components/DatePicker';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import Button from '@/components/Button';
import { format, isSameDay, addHours, setHours, setMinutes } from 'date-fns';
import { TimeSlot } from '@/types';
import { supabase } from '@/lib/supabase';

// Helper function to generate time slots for a given date
const generateTimeSlots = (date: Date, existingBookings: any[]): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8; // Start at 8 AM
  const endHour = 22; // End at 10 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = setMinutes(setHours(date, hour), 0);
    const endTime = addHours(startTime, 1);
    
    // Check if slot overlaps with any existing booking
    const isBooked = existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_time);
      const bookingEnd = new Date(booking.end_time);
      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd)
      );
    });
    
    if (!isBooked) {
      slots.push({
        id: `${hour}`,
        startTime,
        endTime,
        available: true
      });
    }
  }
  
  return slots;
};

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  useEffect(() => {
    fetchCourtDetails();
  }, [id]);
  
  useEffect(() => {
    if (court) {
      fetchTimeSlots();
    }
  }, [selectedDate, court]);
  
  const fetchCourtDetails = async () => {
    try {
      const { data: courtData, error } = await supabase
        .from('courts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setCourt(courtData);
    } catch (error) {
      console.error('Error fetching court details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTimeSlots = async () => {
    try {
      // Fetch bookings for the selected date
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('court_id', id)
        .gte('start_time', startOfDay.toISOString())
        .lte('end_time', endOfDay.toISOString());
      
      if (error) throw error;
      
      // Generate available time slots
      const slots = generateTimeSlots(selectedDate, bookings || []);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
    }
  };
  
  const handleBooking = () => {
    if (selectedSlot) {
      router.push({
        pathname: '/booking/create',
        params: {
          courtId: id,
          startTime: selectedSlot.startTime.toISOString(),
          endTime: selectedSlot.endTime.toISOString()
        }
      });
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  if (!court) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Court not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: court.image_url }} style={styles.image} />
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.courtName}>{court.name}</Text>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <MapPin size={16} color={theme.colors.gray[600]} />
              <Text style={styles.detailText}>{court.surface}</Text>
            </View>
            <View style={styles.detailItem}>
              <DoorClosed size={16} color={theme.colors.gray[600]} />
              <Text style={styles.detailText}>{court.indoor ? 'Intérieur' : 'Extérieur'}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{court.description}</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.featuresList}>
            {(court.features || []).map((feature: string, index: number) => (
              <View key={index} style={styles.featureItem}>
                <CheckCircle size={16} color={theme.colors.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.bookingSection}>
          <Text style={styles.sectionTitle}>Réserver</Text>
          <DatePicker 
            selectedDate={selectedDate}
            onSelectDate={date => {
              setSelectedDate(date);
              setSelectedSlot(null);
            }}
          />
          
          <TimeSlotPicker 
            timeSlots={timeSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {selectedSlot && (
          <View style={styles.selectedSlotInfo}>
            <Text style={styles.selectedSlotDate}>
              {format(selectedSlot.startTime, 'dd/MM/yyyy')}
            </Text>
            <Text style={styles.selectedSlotTime}>
              {format(selectedSlot.startTime, 'HH:mm')} - {format(selectedSlot.endTime, 'HH:mm')}
            </Text>
          </View>
        )}
        <Button
          title={selectedSlot ? "Réserver" : 'Sélectionner un créneau'}
          onPress={handleBooking}
          disabled={!selectedSlot}
          size="lg"
          style={styles.bookButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  courtName: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.xs,
  },
  descriptionContainer: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[700],
    lineHeight: 22,
  },
  featuresContainer: {
    marginBottom: theme.spacing.xl,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
    marginLeft: theme.spacing.xs,
  },
  bookingSection: {
    marginBottom: theme.spacing.xl,
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
  selectedSlotInfo: {
    flex: 1,
  },
  selectedSlotDate: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  selectedSlotTime: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  bookButton: {
    flex: 1,
  },
});