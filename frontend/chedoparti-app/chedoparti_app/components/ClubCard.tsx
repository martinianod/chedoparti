import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { Star, MapPin, Clock, Wifi, Car, Utensils, Droplets } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ClubProps {
  name: string;
  address: string;
  image: string;
  rating: number;
  reviews: number;
  minPrice: number;
  tags: string[];
  slots?: string[];
  amenities?: string[];
  isPromoted?: boolean;
  onPress: () => void;
  onSlotPress: (time: string) => void;
  style?: ViewStyle;
}

export default function ClubCard({ name, address, image, rating, reviews, minPrice, tags, slots, amenities, isPromoted, onPress, onSlotPress, style }: ClubProps) {
  
  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi size={12} color={Colors.textSecondaryLight} />;
      case 'parking': return <Car size={12} color={Colors.textSecondaryLight} />;
      case 'bar':
      case 'restaurant': 
      case 'grill': return <Utensils size={12} color={Colors.textSecondaryLight} />;
      case 'showers': return <Droplets size={12} color={Colors.textSecondaryLight} />;
      default: return null;
    }
  };
  return (
    <View style={[styles.outerContainer, style]}>
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
        <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
            {isPromoted && (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Destacado</Text>
            </View>
            )}
            <View style={styles.priceTag}>
            <Text style={styles.priceText}>desde ${minPrice}</Text>
            </View>
        </View>

        <View style={styles.content}>
            <View style={styles.headerRow}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.ratingContainer}>
                <Star size={14} color={Colors.primary} fill={Colors.primary} />
                <Text style={styles.rating}>{rating}</Text>
                <Text style={styles.reviews}>({reviews})</Text>
            </View>
            </View>

            <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.textSecondaryLight} />
            <Text style={styles.address} numberOfLines={1}>{address}</Text>
            </View>

            <View style={styles.tagsRow}>
            {tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                </View>
            ))}
            </View>

            {amenities && amenities.length > 0 && (
              <View style={styles.amenitiesRow}>
                {amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityTag}>
                    {getAmenityIcon(amenity)}
                    <Text style={styles.amenityText}>{amenity.charAt(0).toUpperCase() + amenity.slice(1)}</Text>
                  </View>
                ))}
              </View>
            )}
        </View>
        </TouchableOpacity>

        {/* TIME SLOTS STRIP */}
        {slots && slots.length > 0 && (
            <View style={styles.slotsContainer}>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotsContent}>
                    {slots.map((time, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={styles.slotChip}
                            onPress={() => onSlotPress(time)}
                        >
                            <Clock size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                            <Text style={styles.slotText}>{time}</Text>
                        </TouchableOpacity>
                    ))}
                 </ScrollView>
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  container: {
    // Inner container logic
  },
  imageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: 'white',
  },
  content: {
    padding: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: Colors.textPrimaryLight,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rating: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.textPrimaryLight,
    marginLeft: 4,
  },
  reviews: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginLeft: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.textSecondaryLight,
    marginLeft: 4,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  tagText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: Colors.primary,
  },
  slotsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  slotsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  slotText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amenityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: Colors.textSecondaryLight,
  },
});
