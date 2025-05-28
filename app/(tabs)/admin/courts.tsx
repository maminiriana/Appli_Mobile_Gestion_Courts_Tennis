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
import { Search, Filter, Plus, X, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, CircleOff, Plus as PlusCircle, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

const AVAILABLE_FEATURES = [
  'Éclairage',
  'Bancs',
  'Filet neuf'
];

export default function CourtsManagementScreen() {
  // ... (previous state declarations remain the same)

  const [showFeatureSelector, setShowFeatureSelector] = useState(false);

  const handleAddFeature = (feature: string) => {
    if (!newCourt.features.includes(feature)) {
      setNewCourt(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    }
    setShowFeatureSelector(false);
  };

  const handleRemoveFeature = (index: number) => {
    setNewCourt(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const FeatureSelectorModal = () => (
    <Modal
      visible={showFeatureSelector}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFeatureSelector(false)}
    >
      <View style={styles.featureModalOverlay}>
        <View style={styles.featureModalContent}>
          <View style={styles.featureModalHeader}>
            <Text style={styles.featureModalTitle}>Sélectionner une caractéristique</Text>
            <TouchableOpacity onPress={() => setShowFeatureSelector(false)}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>
          
          <ScrollView>
            {AVAILABLE_FEATURES.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureOption}
                onPress={() => handleAddFeature(feature)}
              >
                <Text style={styles.featureOptionText}>{feature}</Text>
                {newCourt.features.includes(feature) && (
                  <Check size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // ... (previous code remains the same until the AddCourtModal)

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
            {/* ... (previous form fields remain the same) ... */}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Caractéristiques</Text>
              <View style={styles.featuresList}>
                {newCourt.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureText}>{feature}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveFeature(index)}
                      style={styles.removeFeatureButton}
                    >
                      <X size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.addFeatureButton}
                  onPress={() => setShowFeatureSelector(true)}
                >
                  <PlusCircle size={24} color={theme.colors.primary} />
                  <Text style={styles.addFeatureText}>Ajouter une caractéristique</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ... (rest of the form fields remain the same) ... */}
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

      <FeatureSelectorModal />
    </Modal>
  );

  // ... (rest of the component remains the same)

  return (
    <View style={styles.container}>
      {/* ... (existing JSX remains the same) ... */}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (previous styles remain the same)

  featureModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  featureModalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    maxHeight: '50%',
  },
  featureModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  featureModalTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  featureOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  featureOptionText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  addFeatureText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  featuresList: {
    gap: theme.spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray[100],
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  featureText: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  removeFeatureButton: {
    padding: theme.spacing.xs,
  },
});