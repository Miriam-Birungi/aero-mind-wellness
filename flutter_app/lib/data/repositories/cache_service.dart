import 'package:hive_flutter/hive_flutter.dart';

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

  Future<void> queueOfflineSync(Map<String, dynamic> data) async {
    final box = await Hive.openBox('app_cache');
    final List<dynamic> queue = box.get('offline_sync_queue', defaultValue: []);
    queue.add(data);
    await box.put('offline_sync_queue', queue);
  }

  Future<List<Map<String, dynamic>>> getQueuedSyncs() async {
    final box = await Hive.openBox('app_cache');
    final List<dynamic> queue = box.get('offline_sync_queue', defaultValue: []);
    return queue.map((e) => Map<String, dynamic>.from(e)).toList();
  }

  Future<void> clearOfflineSyncQueue() async {
    final box = await Hive.openBox('app_cache');
    await box.delete('offline_sync_queue');
  }
}
