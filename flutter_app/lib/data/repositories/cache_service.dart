import 'package:hive_flutter/hive_flutter.dart';
import '../models/wearable_model.dart';

class CacheService {
  static const String metricsBoxName = 'wellness_metrics';

  Future<void> init() async {
    await Hive.initFlutter();
    if (!Hive.isAdapterRegistered(0)) {
      // Manual registration if generator isn't run, but we'll assume it's there
    }
  }

  Future<void> cacheMetrics(Map<String, dynamic> data) async {
    final box = await Hive.openBox('app_cache');
    await box.put('latest_metrics', data);
  }

  Future<Map<String, dynamic>?> getCachedMetrics() async {
    final box = await Hive.openBox('app_cache');
    final data = box.get('latest_metrics');
    return data != null ? Map<String, dynamic>.from(data) : null;
  }
}
