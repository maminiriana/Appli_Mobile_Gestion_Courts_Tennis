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
  Image,
  Modal,
  Platform
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search, Filter, UserCheck, UserX, Shield, CreditCard as Edit2, X, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/components/Button';
import bcrypt from 'bcryptjs';

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  subscription_status: boolean;
  profile_image: string | null;
}

interface EditFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password?: string; // Optional because we don't want to update password every time
}

const AddUserModal = ({ visible, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'joueur',
    subscription_status: false,
    profile_image: null
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
            <Text style={styles.modalTitle}>Ajouter un membre</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Mot de passe"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) => handleChange('first_name', text)}
                placeholder="Prénom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) => handleChange('last_name', text)}
                placeholder="Nom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Téléphone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cotisation à jour</Text>
              <Switch
                value={formData.subscription_status}
                onValueChange={(value) => handleChange('subscription_status', value)}
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

const EditUserModal = ({ user, visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<EditFormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    password: '', // Initialize empty password
  });

  const handleChange = (field: keyof EditFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Only include password in the update if it was changed
    const updateData = {
      ...formData,
      password: formData.password ? formData.password : undefined
    };
    onSubmit(updateData);
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
            <Text style={styles.modalTitle}>Modifier le profil</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) => handleChange('first_name', text)}
                placeholder="Prénom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) => handleChange('last_name', text)}
                placeholder="Nom"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleChange('phone', text)}
                placeholder="Téléphone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nouveau mot de passe (laisser vide pour ne pas modifier)</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
                placeholder="Nouveau mot de passe"
                secureTextEntry
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
              title="Enregistrer"
              onPress={handleSubmit}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function UsersManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_name');

      if (error) throw error;

      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (userId) => {
    if (isUploading) return;

    try {
      setIsUploading(true);

      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        const file = await new Promise((resolve, reject) => {
          input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) resolve(file);
            else reject(new Error('No file selected'));
          };
          input.click();
        });

        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        await updateUserProfile(userId, { profile_image: base64 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Permission denied');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          await updateUserProfile(userId, { profile_image: base64Image });
        }
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          subscription_status: !currentStatus,
          last_subscription_date: !currentStatus ? new Date().toISOString() : null
        })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err.message);
    }
  };

  const toggleAdminRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'joueur' : 'admin';
      
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      await fetchUsers();
      Alert.alert(
        'Succès',
        `L'utilisateur est maintenant ${newRole === 'admin' ? 'administrateur' : 'joueur'}`
      );
    } catch (err) {
      console.error('Error toggling admin role:', err);
      Alert.alert('Erreur', 'Impossible de modifier le rôle de l\'utilisateur');
    }
  };

  const updateUserProfile = async (userId, updates) => {
    try {
      // If there's a password update, hash it first
      if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(updates.password, salt);
        updates.password = hashedPassword;
      }

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      Alert.alert('Error', 'Failed to update user profile');
    }
  };

  const handleAddUser = async (userData: FormData) => {
    if (!userData.email || !userData.password || !userData.first_name || !userData.last_name) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const { data, error: createError } = await supabase
        .from('users')
        .insert({
          ...userData,
          password: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      Alert.alert('Succès', 'Le membre a été ajouté avec succès');
      setShowAddModal(false);
      await fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      Alert.alert('Erreur', 'Impossible d\'ajouter le membre');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updates: EditFormData) => {
    if (!editingUser) return;

    try {
      await updateUserProfile(editingUser.id, updates);
      setEditingUser(null);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    }
  };

  const renderProfileImage = (user) => {
    if (user.profile_image) {
      return (
        <Image
          source={{ uri: user.profile_image }}
          style={styles.profileImage}
        />
      );
    }

    return (
      <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
        <Text style={styles.profileImagePlaceholderText}>
          {user.first_name?.charAt(0) || user.email.charAt(0)}
        </Text>
      </View>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showActiveOnly) {
      return matchesSearch && user.subscription_status;
    }
    
    return matchesSearch;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un membre..."
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
            <Text style={styles.filterText}>Afficher uniquement les membres actifs</Text>
            <Switch
              value={showActiveOnly}
              onValueChange={setShowActiveOnly}
              trackColor={{ false: theme.colors.gray[300], true: theme.colors.primary }}
            />
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredUsers.map(user => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userHeader}>
              <TouchableOpacity
                style={styles.profileImageContainer}
                onPress={() => handleImageUpload(user.id)}
              >
                {renderProfileImage(user)}
                <View style={styles.editOverlay}>
                  <Edit2 size={16} color={theme.colors.background} />
                </View>
              </TouchableOpacity>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.roleContainer}>
                  <Shield size={16} color={user.role === 'admin' ? theme.colors.primary : theme.colors.gray[500]} />
                  <Text style={[
                    styles.roleText,
                    user.role === 'admin' && styles.adminRoleText
                  ]}>
                    {user.role === 'admin' ? 'Administrateur' : 'Joueur'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingUser(user)}
              >
                <Edit2 size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userPhone}>{user.phone || 'Aucun numéro'}</Text>
              <Text style={styles.subscriptionDate}>
                Dernière cotisation: {user.last_subscription_date 
                  ? format(new Date(user.last_subscription_date), 'dd/MM/yyyy')
                  : 'Jamais'}
              </Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.roleButton]}
                onPress={() => toggleAdminRole(user.id, user.role)}
              >
                <Text style={styles.actionButtonText}>
                  {user.role === 'admin' ? 'Retirer admin' : 'Promouvoir admin'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.actionButton, 
                  user.subscription_status ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={() => toggleUserStatus(user.id, user.subscription_status)}
              >
                <Text style={styles.actionButtonText}>
                  {user.subscription_status ? 'Désactiver' : 'Activer'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          visible={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}

      <AddUserModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        isLoading={loading}
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    color: theme.colors.background,
    fontSize: 24,
    fontFamily: theme.fonts.bold,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text,
  },
  userEmail: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleText: {
    fontFamily: theme.fonts.medium,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  adminRoleText: {
    color: theme.colors.primary,
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  userDetails: {
    marginBottom: theme.spacing.md,
  },
  userPhone: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
  },
  subscriptionDate: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[600],
    marginTop: 4,
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
  roleButton: {
    backgroundColor: theme.colors.primary,
  },
  activateButton: {
    backgroundColor: theme.colors.success,
  },
  deactivateButton: {
    backgroundColor: theme.colors.error,
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