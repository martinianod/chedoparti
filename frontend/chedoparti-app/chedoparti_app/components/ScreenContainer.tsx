import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

/**
 * A responsive container that:
 * - On Mobile: Fills 100% width
 * - On Web/Desktop: Centers content with a max-width (e.g., 1200px)
 */
export const ScreenContainer = ({ children, style, contentContainerStyle }: ScreenContainerProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Removed flex: 1 to allow auto-height usage (e.g. in Headers)
    alignItems: 'center', 
    width: '100%',
    backgroundColor: Platform.select({ web: '#F8F9FA', default: '#F8F9FA' }),
  },
  content: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    alignSelf: 'center',
  },
});
