import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    Switch
} from 'react-native';

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [changesMade, setChangesMade] = useState(false);

  // Static user data
  const staticUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    bio: 'Tech enthusiast and avid traveler. Love exploring new places and trying out latest gadgets.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    joinDate: '2023-01-15',
    membership: 'Gold Member',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  };

  // Avatar options
  const avatarOptions = [
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setUser(staticUser);
      setFormData({
        firstName: staticUser.firstName,
        lastName: staticUser.lastName,
        email: staticUser.email,
        phone: staticUser.phone,
        dateOfBirth: staticUser.dateOfBirth,
        gender: staticUser.gender,
        bio: staticUser.bio
      });
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // Check if changes were made
    if (user) {
      const hasChanges = 
        formData.firstName !== user.firstName ||
        formData.lastName !== user.lastName ||
        formData.email !== user.email ||
        formData.phone !== user.phone ||
        formData.dateOfBirth !== user.dateOfBirth ||
        formData.gender !== user.gender ||
        formData.bio !== user.bio;
      
      setChangesMade(hasChanges);
    }
  }, [formData, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = 'Bio must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving.');
      return;
    }

    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        ...formData
      }));
      setSaving(false);
      setChangesMade(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1500);
  };

  const handleCancel = () => {
    if (changesMade && user) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                bio: user.bio
              });
              setErrors({});
            }
          }
        ]
      );
    }
  };

  const changeAvatar = (avatarUrl) => {
    setUser(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
    setAvatarModalVisible(false);
    Alert.alert('Success', 'Profile picture updated!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Edit Profile</Text>
      <Text style={styles.headerSubtitle}>Update your personal information</Text>
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: user?.avatar || staticUser.avatar }} 
          style={styles.avatar} 
        />
        <TouchableOpacity 
          style={styles.changeAvatarButton}
          onPress={() => setAvatarModalVisible(true)}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.changeAvatarTextButton}
        onPress={() => setAvatarModalVisible(true)}
      >
        <Text style={styles.changeAvatarText}>Change Profile Photo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPersonalInfoSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[
              styles.input,
              errors.firstName && styles.inputError
            ]}
            value={formData.firstName}
            onChangeText={(text) => handleInputChange('firstName', text)}
            placeholder="Enter first name"
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>
        
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={[
              styles.input,
              errors.lastName && styles.inputError
            ]}
            value={formData.lastName}
            onChangeText={(text) => handleInputChange('lastName', text)}
            placeholder="Enter last name"
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address *</Text>
        <TextInput
          style={[
            styles.input,
            errors.email && styles.inputError
          ]}
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
          placeholder="Enter email address"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[
            styles.input,
            errors.phone && styles.inputError
          ]}
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
        {errors.phone && (
          <Text style={styles.errorText}>{errors.phone}</Text>
        )}
      </View>

      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.dateOfBirth}
            onChangeText={(text) => handleInputChange('dateOfBirth', text)}
            placeholder="YYYY-MM-DD"
          />
          {formData.dateOfBirth ? (
            <Text style={styles.hintText}>
              {formatDate(formData.dateOfBirth)}
            </Text>
          ) : null}
        </View>
        
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderOptions}>
            <TouchableOpacity
              style={[
                styles.genderOption,
                formData.gender === 'male' && styles.genderOptionSelected
              ]}
              onPress={() => handleInputChange('gender', 'male')}
            >
              <Text style={[
                styles.genderOptionText,
                formData.gender === 'male' && styles.genderOptionTextSelected
              ]}>
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                formData.gender === 'female' && styles.genderOptionSelected
              ]}
              onPress={() => handleInputChange('gender', 'female')}
            >
              <Text style={[
                styles.genderOptionText,
                formData.gender === 'female' && styles.genderOptionTextSelected
              ]}>
                Female
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderOption,
                formData.gender === 'other' && styles.genderOptionSelected
              ]}
              onPress={() => handleInputChange('gender', 'other')}
            >
              <Text style={[
                styles.genderOptionText,
                formData.gender === 'other' && styles.genderOptionTextSelected
              ]}>
                Other
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBioSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>About Me</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Bio {formData.bio ? `(${formData.bio.length}/200)` : ''}
        </Text>
        <TextInput
          style={[
            styles.textArea,
            errors.bio && styles.inputError
          ]}
          value={formData.bio}
          onChangeText={(text) => handleInputChange('bio', text)}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        {errors.bio && (
          <Text style={styles.errorText}>{errors.bio}</Text>
        )}
        <Text style={styles.hintText}>
          Share a brief description about yourself (max 200 characters)
        </Text>
      </View>
    </View>
  );

  const renderSocialLinksSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Social Links</Text>
      
      <View style={styles.formGroup}>
        <View style={styles.socialInputContainer}>
          <Ionicons name="logo-facebook" size={20} color="#1877F2" style={styles.socialIcon} />
          <TextInput
            style={styles.socialInput}
            value={user?.socialLinks?.facebook || ''}
            onChangeText={(text) => {
              setUser(prev => ({
                ...prev,
                socialLinks: {
                  ...prev.socialLinks,
                  facebook: text
                }
              }));
            }}
            placeholder="Facebook profile URL"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.socialInputContainer}>
          <Ionicons name="logo-twitter" size={20} color="#1DA1F2" style={styles.socialIcon} />
          <TextInput
            style={styles.socialInput}
            value={user?.socialLinks?.twitter || ''}
            onChangeText={(text) => {
              setUser(prev => ({
                ...prev,
                socialLinks: {
                  ...prev.socialLinks,
                  twitter: text
                }
              }));
            }}
            placeholder="Twitter profile URL"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.socialInputContainer}>
          <Ionicons name="logo-instagram" size={20} color="#E4405F" style={styles.socialIcon} />
          <TextInput
            style={styles.socialInput}
            value={user?.socialLinks?.instagram || ''}
            onChangeText={(text) => {
              setUser(prev => ({
                ...prev,
                socialLinks: {
                  ...prev.socialLinks,
                  instagram: text
                }
              }));
            }}
            placeholder="Instagram profile URL"
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <View style={styles.socialInputContainer}>
          <Ionicons name="logo-linkedin" size={20} color="#0A66C2" style={styles.socialIcon} />
          <TextInput
            style={styles.socialInput}
            value={user?.socialLinks?.linkedin || ''}
            onChangeText={(text) => {
              setUser(prev => ({
                ...prev,
                socialLinks: {
                  ...prev.socialLinks,
                  linkedin: text
                }
              }));
            }}
            placeholder="LinkedIn profile URL"
          />
        </View>
      </View>
    </View>
  );

  const renderAvatarModal = () => (
    <Modal
      visible={avatarModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAvatarModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
            <TouchableOpacity onPress={() => setAvatarModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarGrid}>
            {avatarOptions.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                style={styles.avatarOption}
                onPress={() => changeAvatar(avatar)}
              >
                <Image source={{ uri: avatar }} style={styles.avatarOptionImage} />
                {user?.avatar === avatar && (
                  <View style={styles.selectedAvatarOverlay}>
                    <Ionicons name="checkmark" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.takePhotoButton}
            onPress={() => {
              setAvatarModalVisible(false);
              Alert.alert('Coming Soon', 'Camera functionality will be available soon!');
            }}
          >
            <Ionicons name="camera" size={20} color="#FF6B6B" />
            <Text style={styles.takePhotoText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity 
        style={[
          styles.cancelButton,
          !changesMade && styles.disabledButton
        ]}
        onPress={handleCancel}
        disabled={!changesMade}
      >
        <Text style={[
          styles.cancelButtonText,
          !changesMade && styles.disabledButtonText
        ]}>
          Cancel
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.saveButton,
          (!changesMade || saving) && styles.disabledButton
        ]}
        onPress={handleSave}
        disabled={!changesMade || saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {renderHeader()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        {renderAvatarSection()}

        {/* Personal Information */}
        {renderPersonalInfoSection()}

        {/* Bio Section */}
        {renderBioSection()}

        {/* Social Links */}
        {renderSocialLinksSection()}

        {/* Spacer for footer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer Actions */}
      {renderFooter()}

      {/* Avatar Modal */}
      {renderAvatarModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  spacer: {
    height: 100,
  },
  // Avatar Section
  avatarSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  changeAvatarTextButton: {
    padding: 8,
  },
  changeAvatarText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  // Sections
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  // Form Styles
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Gender Options
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderOptionSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff5f5',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  genderOptionTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  // Social Links
  socialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  socialIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  socialInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 15,
    fontSize: 16,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 2,
    padding: 15,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#999',
  },
  // Avatar Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  selectedAvatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  takePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  takePhotoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default EditProfileScreen;