import 'package:flutter_test/flutter_test.dart';
import 'package:aero_mind_wellness/main.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aero_mind_wellness/data/repositories/api_service.dart';
import 'package:aero_mind_wellness/data/repositories/auth_repository_impl.dart';
import 'package:aero_mind_wellness/logic/blocs/auth_bloc.dart';
import 'package:aero_mind_wellness/logic/blocs/wellness_bloc.dart';

void main() {
  testWidgets('Landing page smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();
    final apiService = ApiService();
    final authRepository = AuthRepositoryImpl(apiService: apiService, prefs: prefs);

    await tester.pumpWidget(
      MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => AuthBloc(authRepository: authRepository)),
          BlocProvider(create: (context) => WellnessBloc(apiService: apiService)),
        ],
        child: const AeroMindApp(),
      ),
    );

    expect(find.text('AeroMind'), findsWidgets);
    expect(find.text('Get Started'), findsOneWidget);
  });
}
