import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:chedoparti_app/features/home/presentation/widgets/club_card.dart';
import 'package:chedoparti_app/features/home/data/models/club_model.dart';

void main() {
  testWidgets('ClubCard displays club info correcty', (WidgetTester tester) async {
    final club = const ClubModel(
      id: '1',
      name: 'Test Club',
      address: 'Test Address',
      imageUrl: 'http://test.com/image.jpg',
      rating: 4.5,
      reviewCount: 10,
      minPrice: 100,
      sports: ['Tennis'],
    );

    await tester.pumpWidget(
      MaterialApp(
        home: ScreenUtilInit(
          designSize: const Size(375, 812),
          builder: (context, child) => Scaffold(
            body: ClubCard(club: club, onTap: () {}),
          ),
        ),
      ),
    );

    // Verify text
    expect(find.text('Test Club'), findsOneWidget);
    expect(find.text('Test Address'), findsOneWidget);
    expect(find.text('4.5 (10)'), findsOneWidget);
  });
}
