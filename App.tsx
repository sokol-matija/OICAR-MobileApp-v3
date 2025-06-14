import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, StyleSheet, Platform, Text, useColorScheme } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ProductsScreen from './screens/ProductsScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import CreateItemScreen from './screens/CreateItemScreen';
import BottomNavigation from './components/BottomNavigation';
import TestComponent from './components/TestComponent';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { UserDTO } from './types/user';
import { CartService } from './utils/cartService';
import { JWTUtils } from './utils/jwtUtils';
import { Alert } from 'react-native';



type Screen = 'test' | 'login' | 'register' | 'home' | 'profile' | 'editProfile' | 'products' | 'cart' | 'orders' | 'sell';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserDTO | null>(null);

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    setCurrentScreen('home');
    console.log('Login successful! Token received:', token ? 'Yes' : 'No');
    console.log('Testin build trigger error');
    console.log('Testing build trigger erro v2');
  };

  const handleRegisterSuccess = () => {
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUserProfile(null);
    setCurrentScreen('login');
  };

  const handleNavigateToProfile = () => {
    setCurrentScreen('profile');
  };

  const handleEditProfile = (userProfile: UserDTO) => {
    setCurrentUserProfile(userProfile);
    setCurrentScreen('editProfile');
  };

  const handleProfileUpdated = (updatedProfile: UserDTO) => {
    setCurrentUserProfile(updatedProfile);
    setCurrentScreen('profile');
  };

  const handleCancelEdit = () => {
    setCurrentScreen('profile');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleReorderItems = async (orderItems: any[]) => {
    Alert.alert('Feature Coming Soon', 'Reorder functionality will be available soon!');
  };

  const getNavigationItems = () => [
    {
      id: 'home',
      icon: '🏠',
      label: 'Home',
      onPress: () => setCurrentScreen('home'),
    },
    {
      id: 'products',
      icon: '🛍️',
      label: 'Products',
      onPress: () => setCurrentScreen('products'),
    },
    {
      id: 'cart',
      icon: 'Cart',
      label: 'Cart',
      onPress: () => setCurrentScreen('cart'),
    },
    {
      id: 'sell',
      icon: '🏪',
      label: 'Sell',
      onPress: () => setCurrentScreen('sell'),
    },
    {
      id: 'orders',
      icon: '📦',
      label: 'Orders',
      onPress: () => setCurrentScreen('orders'),
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile',
      onPress: () => setCurrentScreen('profile'),
    },
  ];

  const screensWithBottomNav = ['home', 'products', 'cart', 'sell', 'orders', 'profile'];
  const showBottomNav = authToken && screensWithBottomNav.includes(currentScreen);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'test':
        return <TestComponent />;
      case 'login':
        return (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen('register')}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'home':
        return (
          <HomeScreen
            token={authToken || undefined}
            onLogout={handleLogout}
            onNavigateToProfile={handleNavigateToProfile}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            token={authToken || undefined}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
          />
        );
      case 'editProfile':
        return currentUserProfile ? (
          <EditProfileScreen
            userProfile={currentUserProfile}
            token={authToken!}
            onProfileUpdated={handleProfileUpdated}
            onCancel={handleCancelEdit}
          />
        ) : null;
      case 'products':
        return (
          <ProductsScreen token={authToken || undefined} />
        );
      case 'cart':
        return (
          <CartScreen 
            token={authToken || undefined}
            onNavigateToOrders={() => setCurrentScreen('orders')}
          />
        );
      case 'sell':
        return (
          <CreateItemScreen
            token={authToken || undefined}
            onItemCreated={() => setCurrentScreen('products')}
            onCancel={() => setCurrentScreen('home')}
          />
        );
      case 'orders':
        return (
          <OrdersScreen 
            token={authToken || undefined}
            onReorderItems={handleReorderItems}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {showBottomNav && (
        <BottomNavigation
          items={getNavigationItems()}
          activeItem={currentScreen}
        />
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  placeholderCard: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderTitle: {
    fontSize: 32,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
  },
});

// Wrap the main app with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
