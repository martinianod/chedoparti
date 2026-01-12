import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Colors } from '../constants/Colors';
import { X, Calendar, Clock, MapPin, Target } from 'lucide-react-native';
import { useBooking, SearchFilters } from '../context/BookingContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FilterModal({ visible, onClose }: FilterModalProps) {
  const { filters, updateFilter } = useBooking();

  // Helper chips
  const renderChips = (
    label: string, 
    options: any[], 
    selected: any, 
    onSelect: (val: any) => void,
    displayMapper?: (val: any) => string
  ) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContainer}>
          {options.map((option, idx) => {
            const isSelected = selected === option;
            const text = displayMapper ? displayMapper(option) : option.toString();
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => onSelect(option)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{text}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const DURATIONS = [60, 90, 120];
  const COURT_COUNTS = [1, 2, 3, 4];
  const ZONES = ['Palermo', 'Belgrano', 'Nuñez', 'Vicente Lopez', 'San Isidro'];
  const TYPES = ['Cualquiera', 'Indoor', 'Outdoor', 'Techada'];
  const AMENITIES = ['wifi', 'parking', 'bar', 'showers', 'restaurant', 'grill'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Filtros</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={Colors.textPrimaryLight} size={24} />
            </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
            
            {/* DATE (Simplified for Demo: Today/Tom/Next) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fecha</Text>
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.dateButton, styles.dateButtonSelected]}>
                        <Text style={styles.dateButtonTextSelected}>Hoy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateButton}>
                        <Text style={styles.dateButtonText}>Mañana</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateButton}>
                        <Calendar size={16} color={Colors.textPrimaryLight} />
                        <Text style={[styles.dateButtonText, { marginLeft: 6 }]}>Elegir fecha</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {renderChips('Duración (minutos)', DURATIONS, filters.duration, (v) => updateFilter('duration', v))}
            
            {renderChips('Cantidad de Canchas', COURT_COUNTS, filters.courtCount, (v) => updateFilter('courtCount', v), (v) => `${v} Cancha${v > 1 ? 's' : ''}`)}

            {renderChips('Zona', ZONES, filters.zone, (v) => updateFilter('zone', v))}
            
            {renderChips('Tipo de Cancha', TYPES, filters.courtType || 'Cualquiera', (v) => updateFilter('courtType', v === 'Cualquiera' ? null : v))}
            
            {renderChips('Comodidades', AMENITIES, filters.amenities || [], (amenity) => {
               // Multiselect logic for amenities
               const current = filters.amenities || [];
               const isSelected = current.includes(amenity);
               const newVal = isSelected 
                 ? current.filter(a => a !== amenity)
                 : [...current, amenity];
               updateFilter('amenities', newVal);
            }, (v) => v.charAt(0).toUpperCase() + v.slice(1))}

        </ScrollView>

        <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                <Text style={styles.applyButtonText}>Ver Resultados</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chipContainer: {
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipSelected: {
    backgroundColor: Colors.textPrimaryLight,
    borderColor: Colors.textPrimaryLight,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textPrimaryLight,
  },
  chipTextSelected: {
    color: 'white',
  },
  dateButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  dateButtonSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: Colors.primary,
  },
  dateButtonText: {
    fontFamily: 'Inter_500Medium',
    color: Colors.textPrimaryLight,
  },
  dateButtonTextSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontFamily: 'Inter_700Bold',
    color: 'white',
    fontSize: 16,
  },
});
