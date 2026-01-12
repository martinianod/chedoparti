import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/home_repository.dart';
import '../../data/models/club_model.dart';
import '../../../../core/network/dio_client.dart';

class HomeController extends AsyncNotifier<List<ClubModel>> {
  @override
  FutureOr<List<ClubModel>> build() {
    return _fetchClubs();
  }

  Future<List<ClubModel>> _fetchClubs() async {
    try {
      final repository = ref.read(homeRepositoryProvider);
      return await repository.getFeaturedClubs();
    } catch (e) {
      // Handle error cleanly
      throw e;
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _fetchClubs());
  }
}

final homeControllerProvider = AsyncNotifierProvider<HomeController, List<ClubModel>>(() {
  return HomeController();
});
