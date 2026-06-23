import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/supabase_api_service.dart';
import '../../data/repositories/cache_service.dart';
import '../../data/repositories/health_service.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

// Events
abstract class WellnessEvent {}
class WellnessMetricsRequested extends WellnessEvent {}
class WellnessSyncRequested extends WellnessEvent {}

// States
abstract class WellnessState {}
class WellnessInitial extends WellnessState {}
class WellnessLoading extends WellnessState {}
class WellnessLoaded extends WellnessState {
  final Map<String, dynamic> data;
  final bool isOffline;
  WellnessLoaded(this.data, {this.isOffline = false});
}
class WellnessError extends WellnessState {
  final String message;
  WellnessError(this.message);
}

// BLoC
class WellnessBloc extends Bloc<WellnessEvent, WellnessState> {
  final SupabaseApiService apiService;
  final HealthService healthService = HealthService();
  final CacheService cacheService = CacheService();

  WellnessBloc({required this.apiService}) : super(WellnessInitial()) {
    on<WellnessMetricsRequested>((event, emit) async {
      emit(WellnessLoading());
      await _fetchAndEmit(emit);
    });

    on<WellnessSyncRequested>((event, emit) async {
      final hasPermission = await healthService.requestPermissions();
      if (!hasPermission) {
        emit(WellnessError('Health permissions denied.'));
        return;
      }

      final healthData = await healthService.fetchLatestData();
      await apiService.syncWearableData(
        heartRate: healthData['heartRate'],
        sleepHours: healthData['sleepHours'],
        steps: healthData['steps'],
      );

      await _fetchAndEmit(emit);
    });
  }

  Future<void> _fetchAndEmit(Emitter<WellnessState> emit) async {
    final connectivityResult = await Connectivity().checkConnectivity();
    final bool isOffline = connectivityResult.contains(ConnectivityResult.none);

    try {
      if (isOffline) {
        final cached = await cacheService.getCachedMetrics();
        if (cached != null) {
          emit(WellnessLoaded(cached, isOffline: true));
        } else {
          emit(WellnessError('Offline and no cached data available.'));
        }
      } else {
        final data = await apiService.getMetrics();
        await cacheService.cacheMetrics(data);
        emit(WellnessLoaded(data));
      }
    } catch (e) {
      final cached = await cacheService.getCachedMetrics();
      if (cached != null) {
        emit(WellnessLoaded(cached, isOffline: true));
      } else {
        emit(WellnessError('Failed to load wellness metrics.'));
      }
    }
  }
}
