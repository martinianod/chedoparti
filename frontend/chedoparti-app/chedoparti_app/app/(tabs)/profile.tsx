import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Settings, ThumbsUp, Zap, Edit2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { MOCK_USER_PROFILE } from '../../constants/Mocks';

import { ScreenContainer } from '../../components/ScreenContainer';
import SettingsModal from '../../components/SettingsModal';

export default function ProfileScreen() {
    const router = useRouter();
    const user = MOCK_USER_PROFILE; // Use the social profile mock
    const [showSettings, setShowSettings] = useState(false);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
              <ScreenContainer>
                  <View style={styles.headerTopRow}>
                      <Text style={styles.title}>Perfil</Text>
                      <TouchableOpacity onPress={() => setShowSettings(true)}>
                          <Settings size={22} color={Colors.textPrimaryLight} />
                      </TouchableOpacity>
                  </View>
              </ScreenContainer>
            </View>

            <ScreenContainer style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                  
                  {/* Identity Section */}
                  <View style={styles.profileHeader}>
                      <Image source={{ uri: user.avatar }} style={styles.avatar} />
                      <Text style={styles.name}>{user.name}</Text>
                      <Text style={styles.location}>{user.location}</Text>
                      <Text style={styles.bio}>{user.bio}</Text>
                  </View>

                  {/* Reliability Score */}
                  <View style={styles.scoreContainer}>
                      <View style={styles.scoreItem}>
                          <View style={styles.scoreIcon}>
                              <ThumbsUp size={18} color="#16A34A" />
                          </View>
                          <View>
                              <Text style={styles.scoreValue}>{user.reliability}%</Text>
                              <Text style={styles.scoreLabel}>Confiabilidad</Text>
                          </View>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.scoreItem}>
                          <View style={[styles.scoreIcon, { backgroundColor: '#FFF7ED' }]}>
                              <Zap size={18} color="#EA580C" />
                          </View>
                          <View>
                              <Text style={styles.scoreValue}>4.8</Text>
                              <Text style={styles.scoreLabel}>Nivel de juego</Text>
                          </View>
                      </View>
                  </View>

                  {/* Sports Cards */}
                  <Text style={styles.sectionTitle}>Mis Deportes</Text>
                  
                  {user.sports.map((sport, index) => (
                      <View key={index} style={styles.sportCard}>
                          <View style={styles.sportHeader}>
                              <Text style={styles.sportName}>{sport.sport}</Text>
                              <View style={styles.badge}>
                                  <Text style={styles.badgeText}>{sport.category}</Text>
                              </View>
                          </View>

                          <View style={styles.statsRow}>
                              <View style={styles.stat}>
                                  <Text style={styles.statLabel}>Partidos</Text>
                                  <Text style={styles.statValue}>{sport.matchesPlayed}</Text>
                              </View>
                              {sport.side && (
                                  <View style={styles.stat}>
                                      <Text style={styles.statLabel}>Posición</Text>
                                      <Text style={styles.statValue}>{sport.side}</Text>
                                  </View>
                              )}
                          </View>
                      </View>
                  ))}

                  <View style={{ height: 40 }} />
              </ScrollView>
            </ScreenContainer>

            <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    // borderBottomWidth: 1, // Optional: remove if you prefer cleaner look
    // borderBottomColor: '#F0F0F0',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    width: '100%',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.textPrimaryLight,
  },
  content: {
    padding: 24,
    paddingTop: 24, 
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textPrimaryLight,
    marginBottom: 4,
  },
  location: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondaryLight,
    marginBottom: 12,
  },
  bio: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: Colors.textPrimaryLight,
    lineHeight: 20,
    maxWidth: '80%',
  },
  scoreContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scoreItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  divider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  scoreIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
  },
  scoreLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textSecondaryLight,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
    marginBottom: 16,
  },
  sportCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'white',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
  },
  stat: {

  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  // Keep original list styles just in case we add settings back at bottom
  section: {
    marginBottom: 24,
  },
  version: {
    textAlign: 'center',
    color: Colors.textSecondaryLight,
    fontSize: 12,
    marginTop: 20,
  }
});
