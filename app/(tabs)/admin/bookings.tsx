import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { bookings, courts } from '@/constants/mockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DatePicker from '@/components/DatePicker';

export default function BookingsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const court = courts.find(c => c.id === booking.courtId);
    const searchString = `${court?.name} ${booking.userId}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return theme.colors.success;
      case 'pending':
        return theme.colors.secondary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.gray[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    // TODO: Implement booking cancellation
    console.log('Cancel booking:', bookingId);
  };

  const handleConfirmBooking = (bookingId: string) => {
    // TODO: Implement booking confirmation
    console.log('Confirm booking:', bookingId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une réservation..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Date</Text>
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              daysToShow={7}
            />
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {filteredBookings.map(booking => {
          const court = courts.find(c => c.id === booking.courtId);
          
          return (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.courtInfo}>
                  <Text style={styles.courtName}>{court?.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(booking.status)}15` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(booking.status) }
                    ]}>
                      {getStatusText(booking.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <Calendar size={16} color={theme.colors.gray[600]} />
                  <Text style={styles.detailText}>
                    {format(booking.startTime, 'EEEE d MMMM yyyy', { locale: fr })}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color={theme.colors.gray[600]} />
                  <Text style={styles.detailText}>
                    {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color={theme.colors.gray[600]} />
                  <Text style={styles.detailText}>
                    {court?.indoor ? 'Court intérieur' : 'Court extérieur'} - {court?.surface}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <User size={16} color={theme.colors.gray[600]} />
                  <Text style={styles.detailText}>
                    ID Utilisateur: {booking.userId}
                  </Text>
                </View>
              </View>

              {booking.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => handleConfirmBooking(booking.id)}
                  >
                    <Text style={styles.actionButtonText}>Confirmer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleCancelBooking(booking.id)}
                  >
                    <Text style={styles.actionButtonText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[100],
  },
  header: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
  },
  filterButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  filterSection: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  filterTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  content: {
    padding: theme.spacing.md,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
  },
  bookingDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[700],
    marginLeft: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  actionButtonText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.background,
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
});