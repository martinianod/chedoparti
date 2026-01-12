import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'models/club_model.dart';
import 'models/court_model.dart';
// import '../../../../core/network/dio_client.dart';

class HomeRepository {
  // final DioClient _dioClient;
  // HomeRepository(this._dioClient);

  Future<List<ClubModel>> getFeaturedClubs() async {
    await Future.delayed(const Duration(seconds: 1)); // Mock Latency
    
    return [
      const ClubModel(
        id: '1',
        name: 'Belgrano Athletic Club',
        address: 'Virrey del Pino 3456, CABA',
        imageUrl: 'https://images.unsplash.com/photo-1622163642998-1ea6a5088274?q=80&w=800&auto=format&fit=crop', // Tennis court
        rating: 4.8,
        reviewCount: 124,
        minPrice: 4500,
        sports: ['Tennis', 'Padel', 'Squash'],
        isPromoted: true,
      ),
      const ClubModel(
        id: '2',
        name: 'El Portón Padel',
        address: 'Dorrego 123, CABA',
        imageUrl: 'https://images.unsplash.com/photo-1554068865-2415f90f23bf?q=80&w=800&auto=format&fit=crop', // Padel
        rating: 4.5,
        reviewCount: 89,
        minPrice: 3200,
        sports: ['Padel'],
      ),
      const ClubModel(
        id: '3',
        name: 'Racket Club',
        address: 'Av. Valentin Alsina 1450',
        imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop', // Tennis
        rating: 4.9,
        reviewCount: 312,
        minPrice: 6000,
        sports: ['Tennis', 'Gym', 'Swimming'],
      ),
    ];
  }

  Future<List<CourtModel>> getCourtsByClubId(String clubId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      const CourtModel(
        id: 'c1',
        clubId: '1',
        name: 'Cancha 1',
        sport: 'Padel',
        surface: SurfaceType.syntheticGrass,
        type: CourtType.indoor,
        pricePerHour: 4500,
        availableSlots: ['10:00', '11:30', '16:00', '17:30', '19:00'],
      ),
      const CourtModel(
        id: 'c2',
        clubId: '1',
        name: 'Cancha 2',
        sport: 'Padel',
        surface: SurfaceType.syntheticGrass,
        type: CourtType.outdoor,
        pricePerHour: 4000,
        availableSlots: ['09:00', '10:30', '15:00'],
      ),
       const CourtModel(
        id: 'c3',
        clubId: '1',
        name: 'Court Central',
        sport: 'Tennis',
        surface: SurfaceType.clay,
        type: CourtType.outdoor,
        pricePerHour: 6000,
        availableSlots: ['10:00', '12:00', '14:00'],
      ),
    ];
  }
}

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  return HomeRepository();
});
