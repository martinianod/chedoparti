import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useBooking } from '../../context/BookingContext';
import { MOCK_USER_PROFILE } from '../../constants/Mocks';
import { ArrowLeft, MapPin, Clock, Calendar, Plus, Share2 } from 'lucide-react-native';

export default function MatchDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { openMatches, joinMatch } = useBooking();

  const match = openMatches.find(m => m.id === id);

  if (!match) return <View style={styles.container}><Text>Match not found</Text></View>;

  const currentUser = MOCK_USER_PROFILE; // In real app, from Auth Context
  
  const isJoined = match.roster?.some(p => p?.id === currentUser.id);
  const isFull = match.missingPlayers === 0;

  const handleJoin = () => {
    if (isJoined) {
        Alert.alert('Ya estás unido', 'Ya formas parte de este partido.');
        return;
    }
    
    joinMatch(match.id, {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar
    });
    
    Alert.alert('¡Te uniste!', 'Ahora eres parte de este partido. El organizador será notificado.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <ArrowLeft size={24} color={Colors.textPrimaryLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Partido</Text>
        <TouchableOpacity>
             <Share2 size={22} color={Colors.textPrimaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Match Info Card */}
        <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
                 <Text style={styles.sportTag}>{match.sport}</Text>
                 <Text style={styles.levelTag}>{match.level}</Text>
            </View>
            
            <View style={styles.row}>
                <Calendar size={18} color={Colors.textSecondaryLight} />
                <Text style={styles.rowText}>Hoy</Text>
            </View>
            <View style={styles.row}>
                <Clock size={18} color={Colors.textSecondaryLight} />
                <Text style={styles.rowText}>{match.time}</Text>
            </View>
             <View style={styles.row}>
                <MapPin size={18} color={Colors.textSecondaryLight} />
                <Text style={styles.rowText}>{match.clubName}</Text>
            </View>
        </View>

        {/* The Roster - Visualizing 4 Slots */}
        <Text style={styles.sectionTitle}>Jugadores ({match.roster?.filter(p => p).length} / {match.roster?.length})</Text>
        
        <View style={styles.rosterGrid}>
            {match.roster?.map((player, index) => (
                <View key={index} style={styles.playerSlot}>
                    {player ? (
                        <>
                            <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
                            <Text style={styles.playerName}>{player.name}</Text>
                            {player.role === 'organizer' && (
                                <View style={styles.organizerBadge}>
                                    <Text style={styles.organizerText}>Host</Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <TouchableOpacity style={styles.emptySlot} onPress={handleJoin}>
                            <View style={styles.plusIcon}>
                                <Plus size={24} color={Colors.primary} />
                            </View>
                            <Text style={styles.emptyText}>Disponible</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costCard}>
             <Text style={styles.costLabel}>Total por persona</Text>
             <Text style={styles.costValue}>${match.pricePerPerson}</Text>
        </View>
        <Text style={styles.costNote}>Se abona en el club antes de jugar.</Text>

      </ScrollView>

      {/* Sticky Action Button */}
      <View style={styles.footer}>
         <TouchableOpacity 
            style={[styles.joinButton, (isJoined || isFull) && styles.joinButtonDisabled]} 
            onPress={handleJoin}
            disabled={isJoined || isFull}
         >
             <Text style={styles.joinButtonText}>
                {isJoined ? 'Ya estás unido' : isFull ? 'Partido Completo' : 'Unirme al partido'}
             </Text>
         </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
      padding: 4,
      marginLeft: -4,
  },
  headerTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sportTag: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
  },
  levelTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  rowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: Colors.textSecondaryLight,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
    marginBottom: 16,
  },
  rosterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  playerSlot: {
    width: '48%', // 2 columns
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    aspectRatio: 1,
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  playerName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimaryLight,
  },
  organizerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  organizerText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#D97706',
  },
  emptySlot: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  plusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.primary,
  },
  costCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  costLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#92400E',
  },
  costValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#92400E',
  },
  costNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: 'white',
  },
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
