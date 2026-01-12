import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal, TouchableWithoutFeedback, Platform, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { X, Calendar, Clock, MapPin, Trash2, Star } from 'lucide-react-native';
import { useBooking } from '../../context/BookingContext';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { reservations, cancelReservation, publishMatch, openMatches } = useBooking();

  const reservation = reservations.find(r => r.id === id);
  // Check if this reservation is already published
  // Note: in a real app, we'd check by ID relationship. Here we can check if any open match matches club/time/organizer or add a 'published' flag.
  // For MVP, we'll assume if it's not in the openMatches list it's not published, but our context logic generates a NEW ID.
  // We can just rely on the user action for now.

  if (!reservation) {
    return (
        <View style={styles.container}>
            <Text>Reserva no encontrada</Text>
        </View>
    );
  }

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState<'publish' | 'cancel' | 'split' | 'feedback' | null>(null);

  const handlePublish = () => {
      setModalType('publish');
      setModalVisible(true);
  };

  const handleCancel = () => {
      setModalType('cancel');
      setModalVisible(true);
  };
  
  const handleSplit = () => {
      setModalType('split');
      setModalVisible(true);
  };

  const handleFeedback = () => {
      setModalType('feedback');
      setModalVisible(true);
  };

  const closeModal = () => {
      setModalVisible(false);
      setModalType(null);
  };

  const confirmPublish = (amount: number) => {
    closeModal();
    publishMatch(reservation.id, amount);
    // Use a small timeout to allow modal to close before alerting (or use a success modal, but Alert 'OK' is fine for simple feedback)
    // Actually, let's just make sure it works. On web Alert.alert with 1 button IS supported usually, but let's stick to safe 'OK' alerts or custom success UI?
    // User complaint was mostly about multi-button alerts not working or returning values.
    setTimeout(() => {
        Alert.alert('¡Partido Publicado!', 'Tu partido ahora es visible en el inicio.');
        router.push('/(tabs)/home');
    }, 100);
  };

  const confirmCancel = () => {
    closeModal();
    cancelReservation(reservation.id);
    router.back();
  };

  const confirmSplit = () => {
      closeModal();
      setTimeout(() => {
        Alert.alert('Solicitud Enviada', 'Tus amigos han recibido el link de pago.');
      }, 100);
  };

  const confirmFeedback = () => {
      closeModal();
      // Logic to save feedback would go here
  };

  const isCancelled = reservation.status === 'cancelled';
  const isCompleted = reservation.status === 'completed';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detalle de Reserva</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={Colors.textPrimaryLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* STATUS BANNER */}
        {isCancelled && (
            <View style={styles.cancelledBanner}>
                <Text style={styles.cancelledText}>Esta reserva ha sido cancelada.</Text>
            </View>
        )}

        <View style={styles.card}>
            <Image source={{ uri: reservation.clubImage }} style={styles.image} />
            
            <View style={styles.info}>
                <Text style={styles.clubName}>{reservation.clubName}</Text>
                <Text style={styles.courtName}>{reservation.courtName} • {reservation.sport}</Text>

                <View style={styles.row}>
                    <Calendar size={16} color={Colors.primary} />
                    <Text style={styles.rowText}>{reservation.date}</Text>
                </View>
                <View style={styles.row}>
                    <Clock size={16} color={Colors.primary} />
                    <Text style={styles.rowText}>{reservation.time} ({reservation.duration} min)</Text>
                </View>
                 <View style={styles.row}>
                    <Text style={styles.priceLabel}>Precio pagado:</Text>
                    <Text style={styles.priceValue}>${reservation.price}</Text>
                </View>
            </View>
        </View>

        {!isCancelled && !isCompleted && (
            <View style={styles.actions}>
                
                {/* HOST ACTION: PUBLISH MATCH */}
                <TouchableOpacity style={[styles.actionButton, styles.publishButton]} onPress={handlePublish}>
                    <Text style={[styles.actionButtonText, styles.publishButtonText]}>Buscar Jugadores (Me falta uno)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleSplit}>
                    <Text style={styles.actionButtonText}>Dividir Gastos</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Trash2 size={20} color={Colors.error} />
                    <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
                </TouchableOpacity>
            </View>
        )}

        {isCompleted && (
            <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionButton, styles.feedbackButton]} onPress={handleFeedback}>
                    <Star size={20} color={Colors.primary} />
                    <Text style={styles.actionButtonText}>Puntuar Experiencia</Text>
                </TouchableOpacity>
            </View>
        )}
        
        {/* CUSTOM MODAL */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
        >
            <TouchableWithoutFeedback onPress={closeModal}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            
                            {modalType === 'publish' && (
                                <>
                                    <Text style={styles.modalTitle}>Buscar Jugadores</Text>
                                    <Text style={styles.modalSubtitle}>¿Cuántos jugadores te faltan?</Text>
                                    <View style={styles.modalOptions}>
                                        <TouchableOpacity style={styles.modalOption} onPress={() => confirmPublish(1)}>
                                            <Text style={styles.modalOptionText}>1 Jugador</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.modalOption} onPress={() => confirmPublish(2)}>
                                            <Text style={styles.modalOptionText}>2 Jugadores</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.modalOption} onPress={() => confirmPublish(3)}>
                                            <Text style={styles.modalOptionText}>3 Jugadores</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {modalType === 'cancel' && (
                                <>
                                    <Text style={styles.modalTitle}>Cancelar Reserva</Text>
                                    <Text style={styles.modalSubtitle}>¿Estás seguro que deseas cancelar tu reserva? Esta acción no se puede deshacer.</Text>
                                    <View style={styles.modalActions}>
                                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={closeModal}>
                                            <Text style={styles.modalButtonSecondaryText}>Volver</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonDestructive]} onPress={confirmCancel}>
                                            <Text style={styles.modalButtonDestructiveText}>Confirmar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {modalType === 'split' && (
                                <>
                                    <Text style={styles.modalTitle}>Dividir Gastos</Text>
                                    <Text style={styles.modalSubtitle}>Se enviará una solicitud a tus amigos recientes para dividir el total de ${reservation.price}.</Text>
                                    
                                    {/* Mock Friends List */}
                                    <View style={styles.friendsList}>
                                         <View style={styles.friendRow}>
                                            <Image source={{ uri: 'https://i.pravatar.cc/150?u=u2' }} style={styles.friendAvatar} />
                                            <Text style={styles.friendName}>Martin G.</Text>
                                            <View style={styles.checkedCircle}><View style={styles.checkedInner} /></View>
                                         </View>
                                         <View style={styles.friendRow}>
                                            <Image source={{ uri: 'https://i.pravatar.cc/150?u=u3' }} style={styles.friendAvatar} />
                                            <Text style={styles.friendName}>Lucas R.</Text>
                                            <View style={styles.checkedCircle} />
                                         </View>
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonSecondary]} onPress={closeModal}>
                                            <Text style={styles.modalButtonSecondaryText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={confirmSplit}>
                                            <Text style={styles.modalButtonPrimaryText}>Enviar Solicitud</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}

                            {modalType === 'feedback' && (
                                <>
                                    <Text style={styles.modalTitle}>¡Gracias por tu opinión!</Text>
                                    <Text style={styles.modalSubtitle}>Nos alegra que hayas disfrutado del partido.</Text>
                                    <View style={styles.starsRow}>
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={32} color="#FFD700" fill="#FFD700" />
                                        ))}
                                    </View>
                                    <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={confirmFeedback}>
                                        <Text style={styles.modalButtonPrimaryText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </>
                            )}

                        </View> 
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: 'white',
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
  cancelledBanner: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  cancelledText: {
    color: Colors.error,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 20,
  },
  clubName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 22,
    color: Colors.textPrimaryLight,
    marginBottom: 4,
  },
  courtName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: Colors.textSecondaryLight,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  rowText: {
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textSecondaryLight,
  },
  priceValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    color: Colors.primary,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    gap: 8,
  },
  publishButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  publishButtonText: {
      color: 'white',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 16,
  },

  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textPrimaryLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: Colors.textSecondaryLight,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOptions: {
    width: '100%',
    gap: 12,
  },
  modalOption: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDEEF0',
  },
  modalOptionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonPrimaryText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  modalButtonSecondary: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#EDEEF0',
  },
  modalButtonSecondaryText: {
    color: Colors.textSecondaryLight,
    fontFamily: 'Inter_600SemiBold',
      fontSize: 16,
  },
  modalButtonDestructive: {
      backgroundColor: '#FFEBEE',
  },
  modalButtonDestructiveText: {
      color: Colors.error,
      fontFamily: 'Inter_700Bold',
      fontSize: 16,
  },
  // Mock Friends
  friendsList: {
      width: '100%',
      marginBottom: 24,
      gap: 12,
  },
  friendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      gap: 12,
  },
  friendAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
  },
  friendName: {
      flex: 1,
      fontFamily: 'Inter_500Medium',
      fontSize: 16,
      color: Colors.textPrimaryLight,
  },
  checkedCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: Colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
  },
  checkedInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors.primary,
  },
  starsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 24,
  },
});
