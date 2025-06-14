import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../components/CustomButton';
import AnonymizationDialog from '../components/AnonymizationDialog';
import { UserService } from '../utils/userService';
import { ProfileService } from '../utils/profileService';
import { JWTUtils } from '../utils/jwtUtils';
import { UserDTO } from '../types/user';
import { UserProfileWithAnonymization, AnonymizationRequest } from '../types/anonymization';

interface ProfileScreenProps {
  token?: string;
  onEditProfile?: (userProfile: UserDTO) => void;
  onLogout?: () => void;
}

export default function ProfileScreen({ token, onEditProfile, onLogout }: ProfileScreenProps) {
  const [userProfile, setUserProfile] = useState<UserProfileWithAnonymization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnonymizationDialog, setShowAnonymizationDialog] = useState(false);
  const [anonymizationRequest, setAnonymizationRequest] = useState<AnonymizationRequest | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [token]);

  const loadUserProfile = async () => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading profile with token:', token.substring(0, 20) + '...');
      
      console.log('Fetching profile with anonymization status...');
      const profile = await ProfileService.getUserProfileWithAnonymization();
      console.log('Profile loaded with anonymization status:', profile);
      
      setUserProfile(profile);
      setAnonymizationRequest(profile.anonymizationRequest || null);
    } catch (error) {
      console.log('Profile loading error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      setError(errorMessage);
      Alert.alert('Error Loading Profile', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (userProfile && onEditProfile) {
      onEditProfile(userProfile);
    }
  };

  const handleAnonymizationRequest = () => {
    setShowAnonymizationDialog(true);
  };

  const handleAnonymizationSuccess = async () => {
    // Reload profile to get updated status
    await loadUserProfile();
  };

  const getAnonymizationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107'; // Warning yellow
      case 'approved': return '#17a2b8'; // Info blue  
      case 'rejected': return '#dc3545'; // Danger red
      case 'completed': return '#28a745'; // Success green
      default: return '#6c757d'; // Secondary gray
    }
  };

  const getAnonymizationStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Request Pending';
      case 'approved': return 'Request Approved';
      case 'rejected': return 'Request Rejected';
      case 'completed': return 'Data Anonymized';
      default: return 'Unknown Status';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarText}>📞 +385 91 772 9143</Text>
        <Text style={styles.topBarText}>✉️ support@snjofkalo.com</Text>
      </View>

      {/* Brand Header */}
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.brandContainer}
      >
        <View style={styles.brand}>
          <Text style={styles.brandIcon}>🏪</Text>
          <Text style={styles.brandText}>Snjofkalo</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          {/* Profile Card */}
          <View style={styles.card}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>👤 My Profile</Text>
            </View>

            {/* Card Body */}
            <View style={styles.cardBody}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <CustomButton
                    testID="profile-retry-button"
                    title="Retry"
                    variant="primary"
                    onPress={loadUserProfile}
                    style={styles.retryButton}
                  />
                </View>
              ) : userProfile ? (
                <>
                  <View style={styles.profileSection}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.profileField}>
                      <Text style={styles.fieldLabel}>Username</Text>
                      <Text style={styles.fieldValue}>{userProfile.username || 'Not specified'}</Text>
                    </View>

                    <View style={styles.profileField}>
                      <Text style={styles.fieldLabel}>Email</Text>
                      <Text style={styles.fieldValue}>{userProfile.email || 'Not specified'}</Text>
                    </View>

                    <View style={styles.profileField}>
                      <Text style={styles.fieldLabel}>First Name</Text>
                      <Text style={styles.fieldValue}>{userProfile.firstName || 'Not specified'}</Text>
                    </View>

                    <View style={styles.profileField}>
                      <Text style={styles.fieldLabel}>Last Name</Text>
                      <Text style={styles.fieldValue}>{userProfile.lastName || 'Not specified'}</Text>
                    </View>

                    <View style={styles.profileField}>
                      <Text style={styles.fieldLabel}>Phone Number</Text>
                      <Text style={styles.fieldValue}>{userProfile.phoneNumber || 'Not specified'}</Text>
                    </View>

                    {userProfile.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminText}>👑 Administrator</Text>
                      </View>
                    )}
                  </View>

                  {/* Anonymization Status Section */}
                  {anonymizationRequest && (
                    <View style={styles.anonymizationSection}>
                      <Text style={styles.sectionTitle}>Data Anonymization</Text>
                      <View style={[styles.statusCard, { borderLeftColor: getAnonymizationStatusColor(anonymizationRequest.status) }]}>
                        <View style={styles.statusHeader}>
                          <Text style={styles.statusLabel}>Status:</Text>
                          <Text style={[styles.statusValue, { color: getAnonymizationStatusColor(anonymizationRequest.status) }]}>
                            {getAnonymizationStatusText(anonymizationRequest.status)}
                          </Text>
                        </View>
                        <View style={styles.statusDetails}>
                          <Text style={styles.statusDetailLabel}>Requested:</Text>
                          <Text style={styles.statusDetailValue}>
                            {new Date(anonymizationRequest.requestDate).toLocaleDateString()}
                          </Text>
                        </View>
                        {anonymizationRequest.processedDate && (
                          <View style={styles.statusDetails}>
                            <Text style={styles.statusDetailLabel}>Processed:</Text>
                            <Text style={styles.statusDetailValue}>
                              {new Date(anonymizationRequest.processedDate).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                        {anonymizationRequest.reason && (
                          <View style={styles.statusDetails}>
                            <Text style={styles.statusDetailLabel}>Reason:</Text>
                            <Text style={styles.statusDetailValue}>{anonymizationRequest.reason}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={styles.buttonSection}>
                    <CustomButton
                      testID="edit-profile-button"
                      title="Edit Profile"
                      variant="primary"
                      onPress={handleEditProfile}
                      style={styles.editButton}
                    />

                    {!anonymizationRequest && (
                      <CustomButton
                        testID="anonymization-request-button"
                        title="🔒 Request Data Anonymization"
                        variant="danger"
                        onPress={handleAnonymizationRequest}
                        style={styles.anonymizationButton}
                      />
                    )}

                    <CustomButton
                      testID="logout-button"
                      title="Logout"
                      variant="outline"
                      onPress={onLogout}
                      style={styles.logoutButton}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>No profile data available</Text>
                  <CustomButton
                    testID="profile-retry-button-2"
                    title="Retry"
                    variant="primary"
                    onPress={loadUserProfile}
                    style={styles.retryButton}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Anonymization Dialog */}
      <AnonymizationDialog
        visible={showAnonymizationDialog}
        onClose={() => setShowAnonymizationDialog(false)}
        onSuccess={handleAnonymizationSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 80, // Space for bottom navigation
  },
  topBar: {
    backgroundColor: '#343a40',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarText: {
    color: '#ffffff',
    fontSize: 12,
  },
  brandContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  contentContainer: {
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 24,
  },
  profileSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
    marginBottom: 16,
  },
  profileField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#343a40',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  adminBadge: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  adminText: {
    color: '#212529',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonSection: {
    gap: 12,
  },
  editButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6c757d',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    width: 120,
  },
  anonymizationSection: {
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusDetailLabel: {
    fontSize: 14,
    color: '#6c757d',
    flex: 1,
  },
  statusDetailValue: {
    fontSize: 14,
    color: '#343a40',
    flex: 2,
    textAlign: 'right',
  },
  anonymizationButton: {
    backgroundColor: '#dc3545',
    marginVertical: 4,
  },
}); 