import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/Colors';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

export default function SettingsItem({ icon, label, onPress, isDestructive }: SettingsItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.left}>
        {icon}
        <Text style={[styles.label, isDestructive && styles.destructiveLabel]}>{label}</Text>
      </View>
      {!isDestructive && <ChevronRight size={20} color={Colors.textSecondaryLight} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  destructiveLabel: {
    color: Colors.error,
  },
});
