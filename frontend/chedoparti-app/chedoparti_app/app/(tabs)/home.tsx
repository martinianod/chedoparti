import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react-native';
import { MOCK_CLUBS, MOCK_OPEN_MATCHES } from '../../constants/Mocks';
import ClubCard from '../../components/ClubCard';
import { useRouter } from 'expo-router';
import FilterModal from '../../components/FilterModal';
import { useBooking } from '../../context/BookingContext';
import { ScreenContainer } from '../../components/ScreenContainer';

const CATEGORIES = ['Todos', 'Padel', 'Tennis', 'Futbol', 'Squash'];

export default function HomeScreen() {
  const router = useRouter();
  const { filters, updateFilter } = useBooking(); // Use global filters if we want persistence
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { width } = Dimensions.get('window');
  const numColumns = width > 1024 ? 3 : width > 768 ? 2 : 1;
  const gap = 16;
  const cardWidth = (100 / numColumns) + "%"; // Simple percentage, but we might need calc to handle gap. 
  // Better approach for flex gap: use calc? No, React Native doesn't support calc.
  // We will handle gap by subtracting it from width percentage.
  // Actually, let's use a simpler approach: define a width style based on columns.
  
  const getGridItemStyle = () => {
    if (numColumns === 1) return { width: '100%' };
    return { width: `${100 / numColumns}%` as any, paddingRight: gap, marginBottom: gap };
    // Note: paddingRight is a hack for gap in flexWrap if not using gap property (which is supported in newer RN but maybe safer without).
    // Actually gap is supported in RN 0.71+, assuming we use that.
    // If using 'gap' in container, we just need width to be (100% - totalGap) / numCols.
  };

  const itemWidth = ((width > 1200 ? 1200 : width) - 40 - (gap * (numColumns - 1))) / numColumns;

  // Filter Logic
  const filteredClubs = MOCK_CLUBS.filter(club => {
    // 1. Category Filter
    const matchesCategory = selectedCategory === 'Todos' || club.sports.includes(selectedCategory);
    
    // 2. Search Text
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 3. Advanced Filters (Mock implementation)
    // In a real app, 'filters' would enable/disable certain clubs or change the available slots shown.
    // For now, we assume all mocks show up unless filtered by text/category.
    const matchesZone = !filters.zone || club.address.includes(filters.zone);

    return matchesCategory && matchesSearch && matchesZone;
  });

  const handleSlotPress = (club: any, time: string) => {
     router.push({
         pathname: '/booking/confirm',
         params: {
             name: club.name,
             image: club.image,
             time: time,
             price: club.minPrice,
             sport: selectedCategory !== 'Todos' ? selectedCategory : club.sports[0]
         }
     });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ScreenContainer>
            {/* Location Header - Airbnb Style */}
            <TouchableOpacity style={styles.locationContainer}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.locationText}>{filters.zone || 'Buenos Aires, AR'}</Text>
            </TouchableOpacity>
            
            {/* Search Bar */}
            <View style={styles.searchRow}>
            <View style={styles.searchBar}>
                <Search size={20} color={Colors.textSecondaryLight} />
                <TextInput 
                placeholder="Buscar club, zona o deporte..." 
                placeholderTextColor="#999"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                />
            </View>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
                <SlidersHorizontal size={20} color="black" />
            </TouchableOpacity>
            </View>

            {/* Categories Scroll */}
            <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesContent}
            style={styles.categoriesContainer}
            >
            {CATEGORIES.map((cat, index) => {
                const isSelected = selectedCategory === cat;
                return (
                <TouchableOpacity 
                    key={index} 
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(cat)}
                >
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                    {cat}
                    </Text>
                </TouchableOpacity>
                )
            })}
            </ScrollView>
        </ScreenContainer>
      </View>

      {/* Content List */}
      <ScreenContainer style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            
            {/* Open Matches Section - STRATEGIC FEATURE */}
            {selectedCategory === 'Todos' && !searchQuery && (
            <View style={styles.openMatchesContainer}>
                <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Partidos buscando jugadores</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>Ver todos</Text>
                </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.openMatchesContent}>
                {MOCK_OPEN_MATCHES.map((match) => (
                    <TouchableOpacity 
                        key={match.id} 
                        style={styles.matchCard}
                        onPress={() => router.push(`/match/${match.id}`)}
                    >
                    <View style={styles.matchHeader}>
                        <Text style={styles.matchSport}>{match.sport}</Text>
                        <View style={styles.matchMissingBadge}>
                            <Text style={styles.matchMissingText}>Faltan {match.missingPlayers}</Text>
                        </View>
                    </View>
                    <Text style={styles.matchTime}>{match.time}</Text>
                    <Text style={styles.matchClub}>{match.clubName}</Text>
                    <View style={styles.matchFooter}>
                        <Text style={styles.matchLevel}>{match.level}</Text>
                        <Text style={styles.matchOrganizer}>Organiza: {match.organizer}</Text>
                    </View>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </View>
            )}

            <Text style={styles.sectionTitle}>
            {selectedCategory === 'Todos' ? 'Clubes populares' : `Canchas de ${selectedCategory}`}
            </Text>
            
            <View style={styles.gridContainer}>
                {filteredClubs.map((club) => (
                <View key={club.id} style={{ width: itemWidth, marginBottom: 16 }}>
                    <ClubCard
                        name={club.name}
                        address={club.address}
                        image={club.image}
                        rating={club.rating}
                        reviews={club.reviews}
                        minPrice={club.minPrice}
                        tags={club.sports}
                        slots={club.slots} // Displaying slots from mock
                        amenities={club.amenities}
                        isPromoted={club.isPromoted}
                        onPress={() => {
                        // Standard details navigation
                        console.log('Open Club', club.id);
                        }}
                        onSlotPress={(time) => handleSlotPress(club, time)}
                    />
                </View>
                ))}
            </View>

            <View style={{ height: 80 }} /> 
        </ScrollView>
      </ScreenContainer>

      {/* Filter Modal */}
      <FilterModal visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Slightly gray background for depth
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.textPrimaryLight,
    marginLeft: 6,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Gray input background
    borderRadius: 50, // Pill shape
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: Colors.textPrimaryLight,
    height: '100%',
    height: '100%',
    outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  categoriesContainer: {
    marginBottom: 0,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipSelected: {
    backgroundColor: Colors.textPrimaryLight, // Black
    borderColor: Colors.textPrimaryLight,
  },
  categoryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: Colors.textPrimaryLight,
  },
  categoryTextSelected: {
    color: 'white',
  },
  listContent: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: Colors.textPrimaryLight,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: Colors.primary,
  },
  openMatchesContainer: {
    marginBottom: 24,
  },
  openMatchesContent: {
    gap: 12,
    paddingRight: 20,
  },
  matchCard: {
    width: 200,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchSport: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: Colors.textSecondaryLight,
    textTransform: 'uppercase',
  },
  matchMissingBadge: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchMissingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: '#E53935',
  },
  matchTime: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: Colors.textPrimaryLight,
    marginBottom: 4,
  },
  matchClub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: Colors.textSecondaryLight,
    marginBottom: 12,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  matchLevel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: Colors.primary,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  matchOrganizer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#999',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
});
