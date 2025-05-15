import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { courts, timeSlots } from '@/constants/mockData';
import { ChevronLeft, MapPin, DoorClosed, CircleCheck as CheckCircle } from 'lucide-react-native';
import DatePicker from '@/components/DatePicker';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import Button from '@/components/Button';
import { format, isSameDay } from 'date-fns';
import { TimeSlot } from '@/types';

export default function CourtDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const court = courts.find(c => c.id === id);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  if (!court) {
    return <Text>Court not found</Text>;
  }
  
  const filteredTimeSlots = timeSlots.filter(
    slot => slot.courtId === court.id && isSameDay(slot.startTime, selectedDate)
  );

  const handleBooking = () => {
    if (selectedSlot) {
      router.push('/booking/create');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.imageContainer}>
        <Image source={{ uri: court.imageUrl }} style={styles.image} />
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
            {court.features.map((feature, index) => (
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
            timeSlots={filteredTimeSlots}
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