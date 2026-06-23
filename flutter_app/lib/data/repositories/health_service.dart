import 'package:health/health.dart';
import 'package:permission_handler/permission_handler.dart';

class HealthService {
  final Health health = Health();

  Future<bool> requestPermissions() async {
    final types = [
      HealthDataType.HEART_RATE,
      HealthDataType.STEPS,
      HealthDataType.SLEEP_ASLEEP,
    ];

    await Permission.activityRecognition.request();
    await Permission.sensors.request();

    return await health.requestAuthorization(types);
  }

  Future<Map<String, dynamic>> fetchLatestData() async {
    final now = DateTime.now();
    final yesterday = now.subtract(const Duration(hours: 24));

    final types = [
      HealthDataType.HEART_RATE,
      HealthDataType.STEPS,
      HealthDataType.SLEEP_ASLEEP,
    ];

    List<HealthDataPoint> healthData = await health.getHealthDataFromTypes(
      startTime: yesterday,
      endTime: now,
      types: types
    );

    int heartRate = 0;
    int steps = 0;
    double sleepHours = 0;

    for (var point in healthData) {
      if (point.type == HealthDataType.HEART_RATE) {
        heartRate = (point.value as NumericHealthValue).numericValue.toInt();
      } else if (point.type == HealthDataType.STEPS) {
        steps += (point.value as NumericHealthValue).numericValue.toInt();
      } else if (point.type == HealthDataType.SLEEP_ASLEEP) {
        final duration = point.dateTo.difference(point.dateFrom);
        sleepHours += duration.inMinutes / 60.0;
      }
    }

    return {
      'heartRate': heartRate > 0 ? heartRate : 70,
      'steps': steps,
      'sleepHours': sleepHours,
      'timestamp': now.toIso8601String(),
    };
  }
}
