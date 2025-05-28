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
  Platform
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, Plus, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, CircleOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

const AVAILABLE_FEATURES = [
  'Éclairage',
  'Bancs',
  'Filet neuf'
];

export default function CourtsManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourt, setNewCourt] = useState({
    name: '',
    description: '',
    surface: '',
    indoor: false,
    features: [],
    image_url: ''
  });

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

  const handleAddCourt = async () => {
    if (!newCourt.name || !newCourt.surface) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('courts')
        .insert({
          ...newCourt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert('Succès', 'Le court a été ajouté avec succès');
      setShowAddModal(false);
      setNewCourt({
        name: '',
        description: '',
        surface: '',
        indoor: false,
        features: [],
        image_url: ''
      });
      await fetchCourts();
    } catch (err) {
      console.error('Error adding court:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter le court');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setNewCourt(prev => {
      const features = [...(prev.features || [])];
      const index = features.indexOf(feature);
      
      if (index > -1) {
        features.splice(index, 1);
      } else {
        features.push(feature);
      }
      
      return {
        ...prev,
        features
      };
    });
  };

  const AddCourtModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un court</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={newCourt.name}
                onChangeText={(text) => setNewCourt(prev => ({ ...prev, name: text }))}
                placeholder="Nom du court"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newCourt.description}
                onChangeText={(text) => setNewCourt(prev => ({ ...prev, description: text }))}
                placeholder="Description du court"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Surface *</Text>
              <TextInput
                style={styles.input}
                value={newCourt.surface}
                onChangeText={(text) => setNewCourt(prev => ({ ...prev, surface: text }))}
                placeholder="Type de surface"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Caractéristiques</Text>
              {AVAILABLE_FEATURES.map((feature, index) => (
                <View key={index} style={styles.featureCheckbox}>
                  <Switch
                    value={newCourt.features?.includes(feature)}
                    onValueChange={() => toggleFeature(feature)}
                  />
                  <Text style={styles.featureLabel}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Court intérieur</Text>
              <Switch
                value={newCourt.indoor}
                onValueChange={(value) => setNewCourt(prev => ({ ...prev, indoor: value }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de l'image</Text>
              <TextInput
                style={styles.input}
                value={newCourt.image_url}
                onChangeText={(text) => setNewCourt(prev => ({ ...prev, image_url: text }))}
                placeholder="URL de l'image du court"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Annuler"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Ajouter"
              onPress={handleAddCourt}
              style={styles.modalButton}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
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
          onPress={() => setShowAddModal(true)}
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
                <Text style={styles.courtName}>{court.name}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: court.is_active ? `${theme.colors.success}20` : `${theme.colors.error}20` }
                ]}>
                  {court.is_active ? (
                    <CheckCircle2 size={16} color={theme.colors.success} />
                  ) : (
                    <CircleOff size={16} color={theme.colors.error} />
                  )}
                  <Text style={[
                    styles.statusText,
                    { color: court.is_active ? theme.colors.success : theme.colors.error }
                  ]}>
                    {court.is_active ? 'Actif' : 'Inactif'}
                  </Text>
                </View>
              </View>

              <Text style={styles.courtDescription}>{court.description}</Text>

              <View style={styles.courtDetails}>
                <Text style={styles.detailLabel}>Surface:</Text>
                <Text style={styles.detailText}>{court.surface}</Text>
              </View>

              <View style={styles.courtDetails}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailText}>
                  {court.indoor ? 'Court intérieur' : 'Court extérieur'}
                </Text>
              </View>

              {court.features && court.features.length > 0 && (
                <View style={styles.featuresContainer}>
                  <Text style={styles.detailLabel}>Caractéristiques:</Text>
                  <View style={styles.featuresList}>
                    {court.features.map((feature, index) => (
                      <View key={index} style={styles.featureTag}>
                        <Text style={styles.featureTagText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
      </ScrollView>

      <AddCourtModal />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  courtName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    marginLeft: 4,
  },
  courtDescription: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
  },
  courtDetails: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.gray[700],
    marginRight: theme.spacing.xs,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  featuresContainer: {
    marginTop: theme.spacing.sm,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
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