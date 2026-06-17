// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'wearable_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

WearableDataModel _$WearableDataModelFromJson(Map<String, dynamic> json) =>
    WearableDataModel(
      timestamp: json['timestamp'] as String,
      heartRate: (json['heartRate'] as num).toInt(),
      sleepHours: (json['sleepHours'] as num).toDouble(),
      steps: (json['steps'] as num).toInt(),
    );

Map<String, dynamic> _$WearableDataModelToJson(WearableDataModel instance) =>
    <String, dynamic>{
      'timestamp': instance.timestamp,
      'heartRate': instance.heartRate,
      'sleepHours': instance.sleepHours,
      'steps': instance.steps,
    };
