import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/api_service.dart';

// Events
abstract class WellnessEvent {}
class WellnessMetricsRequested extends WellnessEvent {}

// States
abstract class WellnessState {}
class WellnessInitial extends WellnessState {}
class WellnessLoading extends WellnessState {}
class WellnessLoaded extends WellnessState {
  final Map<String, dynamic> data;
  WellnessLoaded(this.data);
}
class WellnessError extends WellnessState {
  final String message;
  WellnessError(this.message);
}

// BLoC
class WellnessBloc extends Bloc<WellnessEvent, WellnessState> {
  final ApiService apiService;

  WellnessBloc({required this.apiService}) : super(WellnessInitial()) {
    on<WellnessMetricsRequested>((event, emit) async {
      emit(WellnessLoading());
      try {
        final data = await apiService.getMetrics();
        emit(WellnessLoaded(data));
      } catch (e) {
        emit(WellnessError('Failed to load wellness metrics.'));
      }
    });
  }
}
