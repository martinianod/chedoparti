import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Calendar, MapPin, ChevronRight, Clock } from 'lucide-react-native';

interface ReservationProps {
  clubName: string;
  date: string;
  sport: string;
  price: number;
  status: string;
  image: string;
  onPress: () => void;
}

export default function ReservationCard({ clubName, date, sport, price, status, image, onPress }: ReservationProps) {
  const isConfirmed = status === 'confirmed';
  const statusColor = isConfirmed ? Colors.success : Colors.textSecondaryLight;
  const statusText = isConfirmed ? 'Confirmada' : 'Finalizada';

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.sport}>{sport}</Text>
            <View style={[styles.statusBadge, { backgroundColor: isConfirmed ? '#E8F5E9' : '#F5F5F5' }]}>
                <Text style={{ color: statusColor, fontSize: 10, fontWeight: '700' }}>{statusText}</Text>
            </View>
        </View>
        
        <Text style={styles.clubName} numberOfLines={1}>{clubName}</Text>
        
        <View style={styles.row}>
            <Calendar size={14} color={Colors.textSecondaryLight} />
            <Text style={styles.dateText}>{date}</Text>
        </View>

        <View style={styles.priceRow}>
            <Text style={styles.price}>${price}</Text>
            <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Ver</Text>
                <ChevronRight size={14} color={Colors.primary} />
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sport: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondaryLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clubName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textPrimaryLight,
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  price: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: Colors.textPrimaryLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
    marginRight: 2,
  },
});
