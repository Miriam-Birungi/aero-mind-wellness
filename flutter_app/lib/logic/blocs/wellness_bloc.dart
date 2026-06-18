import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/supabase_api_service.dart';
import '../../data/repositories/cache_service.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

// Events
abstract class WellnessEvent {}
class WellnessMetricsRequested extends WellnessEvent {}

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
  final CacheService cacheService = CacheService();

  WellnessBloc({required this.apiService}) : super(WellnessInitial()) {
    on<WellnessMetricsRequested>((event, emit) async {
      emit(WellnessLoading());

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
        // Fallback to cache on error
        final cached = await cacheService.getCachedMetrics();
        if (cached != null) {
          emit(WellnessLoaded(cached, isOffline: true));
        } else {
          emit(WellnessError('Failed to load wellness metrics.'));
        }
      }
    });
  }
}
