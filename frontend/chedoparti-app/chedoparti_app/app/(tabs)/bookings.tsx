import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useBooking, Reservation } from '../../context/BookingContext';
import ReservationCard from '../../components/ReservationCard';
import { useRouter } from 'expo-router';

export default function BookingsScreen() {
  const router = useRouter();
  const { reservations } = useBooking();

  const upcoming = reservations.filter((r: Reservation) => r.status === 'confirmed');
  const past = reservations.filter((r: Reservation) => r.status !== 'confirmed');

  const goToDetails = (id: string) => {
    router.push({ pathname: '/booking/details', params: { id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {upcoming.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Próximas</Text>
            {upcoming.map((item: Reservation) => (
              <ReservationCard 
                key={item.id} 
                {...item} 
                onPress={() => goToDetails(item.id)}
              />
            ))}
          </View>
        ) : (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No tienes reservas próximas</Text>
            </View>
        )}

        {past.length > 0 && (
            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial</Text>
            {past.map((item: Reservation) => (
                <ReservationCard 
                    key={item.id} 
                    {...item} 
                    onPress={() => goToDetails(item.id)}
                />
                ))}
            </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: Colors.textPrimaryLight,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
    marginBottom: 16,
  },
  emptyState: {
      padding: 20,
      alignItems: 'center',
      marginBottom: 30,
  },
  emptyText: {
      color: Colors.textSecondaryLight,
      fontFamily: 'Inter_500Medium',
  },
});
