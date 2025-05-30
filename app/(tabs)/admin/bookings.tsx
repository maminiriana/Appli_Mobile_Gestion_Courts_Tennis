import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, Plus, X, Calendar, Clock, MapPin, User } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DatePicker from '@/components/DatePicker';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

interface FormData {
  user_id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: string;
}

const AddBookingModal = ({ visible, onClose, onSubmit, isLoading, courts, users }) => {
  const [formData, setFormData] = useState<FormData>({
    user_id: '',
    court_id: '',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
    status: 'pending'
  });

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter une réservation</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Membre *</Text>
              <TextInput
                style={styles.input}
                value={users.find(u => u.id === formData.user_id)?.email || ''}
                onChangeText={(text) => {
                  const user = users.find(u => u.email.toLowerCase().includes(text.toLowerCase()));
                  if (user) {
                    handleChange('user_id', user.id);
                  }
                }}
                placeholder="Email du membre"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Court *</Text>
              <TextInput
                style={styles.input}
                value={courts.find(c => c.id === formData.court_id)?.name || ''}
                onChangeText={(text) => {
                  const court = courts.find(c => c.name.toLowerCase().includes(text.toLowerCase()));
                  if (court) {
                    handleChange('court_id', court.id);
                  }
                }}
                placeholder="Nom du court"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date et heure de début *</Text>
              <TextInput
                style={styles.input}
                value={format(new Date(formData.start_time), 'dd/MM/yyyy HH:mm')}
                onChangeText={(text) => {
                  // Add date picker logic here
                }}
                placeholder="Date et heure de début"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date et heure de fin *</Text>
              <TextInput
                style={styles.input}
                value={format(new Date(formData.end_time), 'dd/MM/yyyy HH:mm')}
                onChangeText={(text) => {
                  // Add date picker logic here
                }}
                placeholder="Date et heure de fin"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Annuler"
              onPress={onClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Ajouter"
              onPress={handleSubmit}
              style={styles.modalButton}
              disabled={isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function BookingsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courts
      const { data: courtsData, error: courtsError } = await supabase
        .from('courts')
        .select('*');

      if (courtsError) throw courtsError;
      setCourts(courtsData);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;
      setUsers(usersData);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('start_time', { ascending: true });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = async (bookingData: FormData) => {
    if (!bookingData.user_id || !bookingData.court_id || !bookingData.start_time || !bookingData.end_time) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      const { data, error: createError } = await supabase
        .from('bookings')
        .insert({
          ...bookingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      Alert.alert('Succès', 'La réservation a été ajoutée avec succès');
      setShowAddModal(false);
      await fetchData();
    } catch (err) {
      console.error('Error adding booking:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter la réservation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.message);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error confirming booking:', err);
      setError(err.message);
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
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

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des réservations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
      </View>
    );
  }

  const filteredBookings = bookings.filter(booking => {
    const court = courts.find(c => c.id === booking.court_id);
    const user = booking.users;
    const searchString = `${court?.name} ${user?.first_name} ${user?.last_name} ${user?.email}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

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
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color={theme.colors.primary} />
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
          const court = courts.find(c => c.id === booking.court_id);
          const user = booking.users;
          
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
                    {format(new Date(booking.start_time), 'EEEE d MMMM yyyy', { locale: fr })}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color={theme.colors.gray[600]} />
                  <Text style={styles.detailText}>
                    {format(new Date(booking.start_time), 'HH:mm')} - {format(new Date(booking.end_time), 'HH:mm')}
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
                    {user?.first_name} {user?.last_name} ({user?.email})
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

      <AddBookingModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddBooking}
        isLoading={loading}
        courts={courts}
        users={users}
      />
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
  addButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
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
  loadingText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  errorText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxHeight: '80%',
    padding: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.xl,
    color: theme.colors.text,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    minWidth: 100,
  },
});