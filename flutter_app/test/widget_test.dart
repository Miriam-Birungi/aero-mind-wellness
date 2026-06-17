import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aero_mind_wellness/main.dart';

void main() {
  testWidgets('Landing page smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: LandingPage(),
      ),
    );

    expect(find.text('AeroMind'), findsWidgets);
    expect(find.text('Get Started'), findsOneWidget);
  });
}
