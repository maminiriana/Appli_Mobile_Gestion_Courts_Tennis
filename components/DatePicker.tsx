import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { format, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { theme } from '@/constants/theme';

interface DatePickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  daysToShow?: number;
}

export default function DatePicker({ selectedDate, onSelectDate, daysToShow = 14 }: DatePickerProps) {
  const today = new Date();
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(today, i));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                isSelected && styles.selectedDateButton,
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text style={[
                styles.dayName,
                isSelected && styles.selectedText,
              ]}>
                {format(date, 'E', { locale: fr })}
              </Text>
              <Text style={[
                styles.dayNumber,
                isSelected && styles.selectedText,
                isToday && styles.todayText,
              ]}>
                {format(date, 'd')}
              </Text>
              {isToday && !isSelected && <View style={styles.todayDot} />}
            </TouchableOpacity>
          );
        })}
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
  dateButton: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.gray[100],
  },
  selectedDateButton: {
    backgroundColor: theme.colors.primary,
  },
  dayName: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginTop: 2,
  },
  selectedText: {
    color: theme.colors.background,
  },
  todayText: {
    color: theme.colors.primary,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
});