import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/auth/presentation/controllers/auth_controller.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/home/presentation/screens/home_screen.dart';
import '../../features/reserve/presentation/screens/club_details_screen.dart';
import '../../features/home/data/models/club_model.dart';
import '../../features/dashboard/presentation/screens/coach_dashboard.dart';
import '../../features/dashboard/presentation/screens/admin_dashboard.dart';
import '../../features/auth/data/models/user_model.dart';

// Use a Notifier to bridge Riverpod state changes to GoRouter's refreshListenable
class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<AsyncValue<UserModel?>>(
      authControllerProvider,
      (_, __) => notifyListeners(),
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) => RouterNotifier(ref));

final goRouterProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);

  return GoRouter(
    initialLocation: '/login', // Start at login to force check
    refreshListenable: notifier, // Re-evaluate redirect on auth change
    redirect: (context, state) {
      final authState = ref.read(authControllerProvider);
      final isLoggedIn = authState.value != null;
      final isLoggingIn = state.uri.toString() == '/login';
      final isRegistering = state.uri.toString() == '/register';

      // 1. If not logged in and not on public pages -> Login
      if (!isLoggedIn && !isLoggingIn && !isRegistering) {
        return '/login';
      }

      // 2. If logged in and on auth pages -> Dashboard/Home
      if (isLoggedIn && (isLoggingIn || isRegistering)) {
        final role = authState.value?.role;
        if (role == UserRole.admin) return '/admin_dashboard';
        if (role == UserRole.coach) return '/coach_dashboard';
        return '/home';
      }

      return null; // No redirection needed
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
       GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/club_details',
        builder: (context, state) {
           final club = state.extra as ClubModel;
           return ClubDetailsScreen(club: club);
        },
      ),
      GoRoute(
        path: '/coach_dashboard',
        builder: (context, state) => const CoachDashboard(),
      ),
      GoRoute(
        path: '/admin_dashboard',
        builder: (context, state) => const AdminDashboard(),
      ),
    ],
  );
});
