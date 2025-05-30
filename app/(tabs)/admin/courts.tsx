import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  TextInput,
  Alert,
  Modal,
  Platform,
  Image
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, Plus, X, CreditCard as Edit2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

const FEATURES = [
  { id: 'lighting', label: 'Éclairage' },
  { id: 'benches', label: 'Bancs' },
  { id: 'newNet', label: 'Filet neuf' }
];

interface FormData {
  name: string;
  description: string;
  surface: string;
  indoor: boolean;
  features: string[];
  image_url: string;
}

interface CourtModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  initialData?: FormData;
  mode: 'add' | 'edit';
}

const CourtModal = ({ visible, onClose, onSubmit, isLoading, initialData, mode }: CourtModalProps) => {
  const [formData, setFormData] = useState<FormData>(initialData || {
    name: '',
    description: '',
    surface: '',
    indoor: false,
    features: [],
    image_url: ''
  });

  useEffect(() => {
    if (initialData && visible) {
      setFormData(initialData);
    }
  }, [initialData, visible]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
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
            <Text style={styles.modalTitle}>
              {mode === 'add' ? 'Ajouter un court' : 'Modifier le court'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Nom du court"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Description du court"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Surface *</Text>
              <TextInput
                style={styles.input}
                value={formData.surface}
                onChangeText={(text) => handleChange('surface', text)}
                placeholder="Type de surface"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de l'image</Text>
              <TextInput
                style={styles.input}
                value={formData.image_url}
                onChangeText={(text) => handleChange('image_url', text)}
                placeholder="URL de l'image du court"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Caractéristiques</Text>
              {FEATURES.map((feature) => (
                <View key={feature.id} style={styles.featureCheckbox}>
                  <Switch
                    value={formData.features.includes(feature.id)}
                    onValueChange={() => toggleFeature(feature.id)}
                  />
                  <Text style={styles.featureLabel}>{feature.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Court intérieur</Text>
              <Switch
                value={formData.indoor}
                onValueChange={(value) => handleChange('indoor', value)}
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
              title={mode === 'add' ? "Ajouter" : "Modifier"}
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

export default function CourtsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name');

      if (error) throw error;
      setCourts(data);
    } catch (err) {
      console.error('Error fetching courts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourt = async (courtData: FormData) => {
    if (!courtData.name || !courtData.surface) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('courts')
        .insert({
          ...courtData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert('Succès', 'Le court a été ajouté avec succès');
      setShowModal(false);
      await fetchCourts();
    } catch (err) {
      console.error('Error adding court:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter le court');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourt = async (courtData: FormData) => {
    if (!courtData.name || !courtData.surface) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('courts')
        .update({
          ...courtData,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingCourt.id);

      if (error) throw error;

      Alert.alert('Succès', 'Le court a été modifié avec succès');
      setShowModal(false);
      setEditingCourt(null);
      await fetchCourts();
    } catch (err) {
      console.error('Error updating court:', err);
      Alert.alert('Erreur', 'Impossible de modifier le court');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (court) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('courts')
        .update({
          is_active: !court.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', court.id);

      if (error) throw error;
      await fetchCourts();
    } catch (err) {
      console.error('Error toggling court status:', err);
      Alert.alert('Erreur', 'Impossible de modifier le statut du court');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (court) => {
    setEditingCourt(court);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleModalSubmit = (data: FormData) => {
    if (modalMode === 'add') {
      handleAddCourt(data);
    } else {
      handleEditCourt(data);
    }
  };

  if (loading && courts.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des courts...</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un court..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterActive(!filterActive)}
        >
          <Filter size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setModalMode('add');
            setEditingCourt(null);
            setShowModal(true);
          }}
        >
          <Plus size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {filterActive && (
        <View style={styles.filterSection}>
          <View style={styles.filterOption}>
            <Text style={styles.filterText}>Afficher uniquement les courts actifs</Text>
            <Switch
              value={showActiveOnly}
              onValueChange={setShowActiveOnly}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
            />
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {courts
          .filter(court => 
            (!showActiveOnly || court.is_active) &&
            court.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(court => (
            <View key={court.id} style={styles.courtCard}>
              <View style={styles.courtHeader}>
                <View style={styles.courtImageContainer}>
                  {court.image_url ? (
                    <Image 
                      source={{ uri: court.image_url }} 
                      style={styles.courtImage}
                    />
                  ) : (
                    <View style={[styles.courtImage, styles.courtImagePlaceholder]}>
                      <Text style={styles.courtImagePlaceholderText}>
                        {court.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.courtInfo}>
                  <Text style={styles.courtName}>{court.name}</Text>
                  <Text style={styles.courtSurface}>{court.surface}</Text>
                  <Text style={styles.courtType}>
                    {court.indoor ? 'Court intérieur' : 'Court extérieur'}
                  </Text>
                </View>
                <View style={styles.courtActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(court)}
                  >
                    <Edit2 size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <Switch
                    value={court.is_active}
                    onValueChange={() => handleToggleActive(court)}
                    trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
                  />
                </View>
              </View>

              {court.features && court.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  {court.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureTagText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
      </ScrollView>

      <CourtModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCourt(null);
        }}
        onSubmit={handleModalSubmit}
        isLoading={loading}
        initialData={editingCourt}
        mode={modalMode}
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
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginRight: theme.spacing.sm,
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
    padding: theme.spacing.sm,
  },
  addButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  filterSection: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  courtCard: {
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
  courtHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courtImageContainer: {
    marginRight: theme.spacing.md,
  },
  courtImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  courtImagePlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courtImagePlaceholderText: {
    color: theme.colors.background,
    fontSize: 24,
    fontFamily: theme.fonts.bold,
  },
  courtInfo: {
    flex: 1,
  },
  courtName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
    marginBottom: 2,
  },
  courtSurface: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  courtType: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[500],
  },
  courtActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  featureTag: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  featureTagText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    maxHeight: '80%',
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
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  featureCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
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
});