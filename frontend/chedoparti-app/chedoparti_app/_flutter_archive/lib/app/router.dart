import 'package:chedoparti_app/features/courts/presentation/pages/courts_page.dart';
import 'package:chedoparti_app/features/rankings/presentation/pages/rankings_page.dart';
import 'package:chedoparti_app/features/reservations/presentation/pages/reservations_page.dart';
import 'package:chedoparti_app/features/tournaments/presentation/pages/tournaments_page.dart';
import 'package:go_router/go_router.dart';
import '../features/splash/pages/splash_page.dart';
import '../features/auth/presentation/pages/login_page.dart';
import '../features/auth/presentation/pages/register_page.dart';
import '../features/dashboard/pages/dashboard_page.dart';
import '../features/profile/pages/profile_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashPage()),
    GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
    GoRoute(path: '/register', builder: (_, __) => const RegisterPage()),
    GoRoute(path: '/dashboard', builder: (_, __) => const DashboardPage()),
    GoRoute(path: '/courts', builder: (_, __) => const CourtsPage()),
    GoRoute(
        path: '/reservations', builder: (_, __) => const ReservationsPage()),
    GoRoute(path: '/tournaments', builder: (_, __) => const TournamentsPage()),
    GoRoute(path: '/rankings', builder: (_, __) => const RankingsPage()),
    GoRoute(path: '/profile', builder: (_, __) => const ProfilePage()),
  ],
);
