import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'core/routes/app_router.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: CheDopartiApp()));
}

class CheDopartiApp extends ConsumerWidget {
  const CheDopartiApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(goRouterProvider);

    // Initialize ScreenUtil for responsive UI
    return ScreenUtilInit(
      designSize: const Size(375, 812), // iPhone X/11/12 standard width
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return MaterialApp.router(
          title: 'CheDoparti',
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.system, // Or control via provider
          routerConfig: router,
          debugShowCheckedModeBanner: false,
        );
      },
    );
  }
}
