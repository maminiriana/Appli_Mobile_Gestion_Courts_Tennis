import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Booking, Court } from '@/types';
import { theme } from '@/constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Circle as XCircle, Clock4 } from 'lucide-react-native';

interface BookingItemProps {
  booking: Booking;
  court?: Court;
  onPress: (booking: Booking) => void;
}

export default function BookingItem({ booking, court, onPress }: BookingItemProps) {
  const startTime = new Date(booking.start_time);
  const endTime = new Date(booking.end_time);

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'confirmed':
        return <CheckCircle size={16} color={theme.colors.success} />;
      case 'pending':
        return <Clock4 size={16} color={theme.colors.secondary} />;
      case 'cancelled':
        return <XCircle size={16} color={theme.colors.error} />;
      case 'completed':
        return <CheckCircle size={16} color={theme.colors.gray[500]} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (booking.status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      case 'completed':
        return 'Complété';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (booking.status) {
      case 'confirmed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.secondary;
      case 'cancelled':
        return theme.colors.error;
      case 'completed':
        return theme.colors.gray[500];
      default:
        return theme.colors.text;
    }
  };

  if (!court) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(booking)}>
      <View style={styles.header}>
        <Text style={styles.courtName}>{court.name}</Text>
        <View style={[styles.statusContainer, { backgroundColor: `${getStatusColor()}20` }]}>
          {getStatusIcon()}
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={theme.colors.gray[600]} />
          <Text style={styles.detailText}>
            {format(startTime, 'EEEE d MMMM yyyy', { locale: fr })}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.colors.gray[600]} />
          <Text style={styles.detailText}>
            {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courtName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.xs,
    marginLeft: 4,
  },
  details: {
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginLeft: theme.spacing.xs,
  },
});