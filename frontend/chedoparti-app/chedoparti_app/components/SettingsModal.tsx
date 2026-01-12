import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../constants/Colors';
import { User, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const SETTINGS_OPTIONS = [
  { id: 'account', icon: User, label: 'Datos Personales', color: Colors.textPrimaryLight },
  { id: 'payments', icon: CreditCard, label: 'Métodos de Pago', color: Colors.textPrimaryLight },
  { id: 'notifications', icon: Bell, label: 'Notificaciones', color: Colors.textPrimaryLight },
  { id: 'help', icon: HelpCircle, label: 'Ayuda y Soporte', color: Colors.textPrimaryLight },
];

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Mock Logout Logic
    onClose();
    // In a real app, this would clear auth state context
    router.replace('/(auth)/login');
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Configuración</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={20} color={Colors.textSecondaryLight} />
                </TouchableOpacity>
              </View>

              {/* Options List */}
              <View style={styles.optionsList}>
                {SETTINGS_OPTIONS.map((option) => (
                  <TouchableOpacity key={option.id} style={styles.optionItem} onPress={() => console.log('Nav to', option.id)}>
                    <View style={styles.optionLeft}>
                      <View style={styles.iconContainer}>
                        <option.icon size={20} color={option.color} />
                      </View>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                    </View>
                    <ChevronRight size={20} color="#E0E0E0" />
                  </TouchableOpacity>
                ))}

                {/* Logout Separate Item */}
                <TouchableOpacity style={[styles.optionItem, styles.logoutItem]} onPress={handleLogout}>
                   <View style={styles.optionLeft}>
                      <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                        <LogOut size={20} color="#D32F2F" />
                      </View>
                      <Text style={styles.logoutLabel}>Cerrar Sesión</Text>
                    </View>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dim background
    justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end', // Center on web, Bottom on mobile
    alignItems: 'center',
  },
  modalContainer: {
    width: Platform.OS === 'web' ? 400 : '100%',
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 16 : 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textPrimaryLight,
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  optionsList: {
    gap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA', // Light Gray
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textPrimaryLight,
  },
  logoutItem: {
    marginTop: 12,
    borderBottomWidth: 0,
  },
  logoutIconContainer: {
    backgroundColor: '#FFEBEE', // Light Red
  },
  logoutLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#D32F2F',
  },
});
