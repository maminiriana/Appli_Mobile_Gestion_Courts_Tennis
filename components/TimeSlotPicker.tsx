import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  isAvailable: boolean;
}

interface TimeSlotPickerProps {
  timeSlots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function TimeSlotPicker({ timeSlots, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  // Group time slots by hour
  const groupedSlots: Record<string, TimeSlot[]> = {};
  
  timeSlots.forEach(slot => {
    const hourKey = slot.start_time;
    if (!groupedSlots[hourKey]) {
      groupedSlots[hourKey] = [];
    }
    groupedSlots[hourKey].push(slot);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horaires disponibles</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {Object.entries(groupedSlots).map(([hourKey, slots]) => (
          <View key={hourKey} style={styles.hourColumn}>
            <Text style={styles.hourHeader}>{hourKey}</Text>
            {slots.map(slot => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotButton,
                  !slot.isAvailable && styles.unavailableSlot,
                  selectedSlot?.id === slot.id && styles.selectedSlot,
                ]}
                onPress={() => slot.isAvailable && onSelectSlot(slot)}
                disabled={!slot.isAvailable}
              >
                <Text 
                  style={[
                    styles.slotText,
                    !slot.isAvailable && styles.unavailableText,
                    selectedSlot?.id === slot.id && styles.selectedText,
                  ]}
                >
                  {slot.start_time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  scrollView: {
    flexDirection: 'row',
  },
  hourColumn: {
    marginRight: theme.spacing.sm,
    width: 80,
  },
  hourHeader: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  slotButton: {
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableSlot: {
    backgroundColor: theme.colors.gray[200],
  },
  selectedSlot: {
    backgroundColor: theme.colors.primary,
  },
  slotText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
  },
  unavailableText: {
    color: theme.colors.gray[500],
  },
  selectedText: {
    color: theme.colors.background,
  },
});