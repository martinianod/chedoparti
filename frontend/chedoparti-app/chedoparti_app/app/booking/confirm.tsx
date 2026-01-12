import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Calendar, Clock, Check, X } from 'lucide-react-native';
import { useBooking } from '../../context/BookingContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ConfirmBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addReservation } = useBooking();
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(90);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Params passed from Home: name, image, date, time, price, sport
  const { name, image, time, price, sport } = params;

  // Mock Courts for this specific slot
  const basePrice = Number(price) || 2000;
  
  // Dynamic price calculation
  const getPrice = (base: number) => {
    return duration === 90 ? base * 1.5 : base;
  };

  const MOCK_COURTS = [
    { id: 'c1', name: 'Cancha 1 (Cristal)', type: 'Indoor', basePrice: basePrice },
    { id: 'c2', name: 'Cancha 2 (Muro)', type: 'Outdoor', basePrice: basePrice - 200 },
  ];

  const handleConfirm = () => {
    if (!selectedCourt) {
        Alert.alert('Selecciona una cancha', 'Por favor elige una cancha para continuar.');
        return;
    }

    const court = MOCK_COURTS.find(c => c.id === selectedCourt);
    const finalPrice = court ? getPrice(court.basePrice) : 0;

    // Create Reservation
    addReservation({
        id: Math.random().toString(),
        clubName: name as string,
        clubImage: image as string,
        date: 'Hoy', // Simplified
        time: time as string,
        duration: duration,
        sport: (sport as string) || 'Padel',
        courtName: court?.name || 'Cancha',
        price: finalPrice,
        status: 'confirmed',
    });

    if (Platform.OS === 'web') {
      setShowConfirmation(true);
    } else {
      Alert.alert('¡Reserva Confirmada!', 'Te esperamos en el club.', [
          { text: 'OK', onPress: () => router.dismissTo('/(tabs)/bookings') }
      ]);
    }
  };

  const handleModalConfirm = () => {
    setShowConfirmation(false);
    router.dismissTo('/(tabs)/bookings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confirmar Reserva</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={Colors.textPrimaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* CLUB INFO */}
        <View style={styles.clubInfo}>
            <Image source={{ uri: image as string }} style={styles.image} />
            <View style={styles.infoText}>
                <Text style={styles.clubName}>{name}</Text>
                <Text style={styles.sportText}>{sport || 'Padel'}</Text>
            </View>
        </View>

        <View style={styles.divider} />

        {/* DATE & TIME INFO */}
        <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
                <Calendar size={20} color={Colors.primary} />
                <View>
                    <Text style={styles.label}>Fecha</Text>
                    <Text style={styles.value}>Hoy, May 15</Text>
                </View>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.dateTimeItem}>
                <Clock size={20} color={Colors.primary} />
                <View>
                    <Text style={styles.label}>Horario</Text>
                    <Text style={styles.value}>{time}</Text>
                </View>
            </View>
        </View>

        <View style={styles.divider} />
        
        {/* DURATION SELECTOR - NEW FEATURE */}
        <Text style={styles.sectionTitle}>Duración del turno</Text>
        <View style={styles.durationContainer}>
            {[60, 90].map((d) => (
                <TouchableOpacity 
                    key={d} 
                    style={[styles.durationChip, duration === d && styles.durationChipSelected]}
                    onPress={() => setDuration(d)}
                >
                    <Text style={[styles.durationText, duration === d && styles.durationTextSelected]}>
                        {d} min
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.divider} />

        {/* COURT SELECTION */}
        <Text style={styles.sectionTitle}>Elige tu cancha</Text>
        <View style={styles.courtList}>
            {MOCK_COURTS.map(court => {
                const isSelected = selectedCourt === court.id;
                const currentPrice = getPrice(court.basePrice);
                
                return (
                    <TouchableOpacity 
                        key={court.id} 
                        style={[styles.courtItem, isSelected && styles.courtItemSelected]}
                        onPress={() => setSelectedCourt(court.id)}
                    >
                        <View>
                            <Text style={styles.courtName}>{court.name}</Text>
                            <Text style={styles.courtType}>{court.type}</Text>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={styles.courtPrice}>${currentPrice}</Text>
                            {isSelected && <Check size={16} color="white" style={styles.checkIcon} />}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>

      </ScrollView>

      {/* FOOTER ACTION */}
      <View style={styles.footer}>
         <View>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalPrice}>
                ${selectedCourt 
                    ? getPrice(MOCK_COURTS.find(c => c.id === selectedCourt)?.basePrice || 0) 
                    : '0'
                }
            </Text>
         </View>
         <TouchableOpacity 
            style={[styles.confirmButton, !selectedCourt && styles.disabledButton]} 
            onPress={handleConfirm}
            disabled={!selectedCourt}
         >
            <Text style={styles.confirmButtonText}>Confirmar</Text>
         </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={showConfirmation}
        title="¡Reserva Confirmada!"
        message="Te esperamos en el club."
        onConfirm={handleModalConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
  },
  content: {
    padding: 24,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  infoText: {
    marginLeft: 16,
  },
  clubName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textPrimaryLight,
  },
  sportText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textSecondaryLight,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 24,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 10,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginBottom: 2,
  },
  value: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
    marginBottom: 16,
  },
  courtList: {
    gap: 12,
  },
  courtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  courtItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F9FF',
  },
  courtName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: Colors.textPrimaryLight,
  },
  courtType: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courtPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  checkIcon: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 2,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
  },
  totalPrice: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: Colors.textPrimaryLight,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButtonText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  durationChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textSecondaryLight,
  },
  durationTextSelected: {
    color: 'white',
  },
});
