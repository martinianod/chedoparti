import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Search, Calendar, User } from 'lucide-react-native';

const TABS = [
  { name: 'Explorar', path: '/(tabs)/home', icon: Search },
  { name: 'Mis Reservas', path: '/(tabs)/bookings', icon: Calendar },
  { name: 'Perfil', path: '/(tabs)/profile', icon: User },
];

export const DesktopHeader = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.content}>
        {/* Logo Area */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/home')} style={styles.logoContainer}>
            <Text style={styles.logoText}>Chedoparti</Text>
        </TouchableOpacity>

        {/* Navigation Links */}
        <View style={styles.navLinks}>
          {TABS.map((tab) => {
            // Check if current path starts with tab path (simple active check)
            // Note: usePathname returns e.g. "/path", our paths are slightly different in router structure but close enough for check
            // Fixing path check logic
            const isActive = pathname.includes(tab.path) || (pathname === '/' && tab.path.includes('home'));
            
            return (
              <TouchableOpacity 
                key={tab.name} 
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(tab.path as any)}
              >
                <tab.icon size={20} color={isActive ? Colors.primary : Colors.textSecondaryLight} />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>{tab.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Area (Could be User Info or Login) */}
        <View style={styles.rightArea}>
            <View style={styles.avatarPlaceholder} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 70,
    width: '100%',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    // Logo styling
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.primary,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 32,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navItemActive: {
    borderBottomColor: Colors.primary,
  },
  navText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textSecondaryLight,
  },
  navTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  rightArea: {
    width: 32,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
  }
});
