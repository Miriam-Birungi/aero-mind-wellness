import 'package:hive/hive.dart';
import 'package:json_annotation/json_annotation.dart';

part 'wearable_model.g.dart';

@JsonSerializable()
@HiveType(typeId: 0)
class WearableDataModel extends HiveObject {
  @HiveField(0)
  final String timestamp;
  @HiveField(1)
  final int heartRate;
  @HiveField(2)
  final double sleepHours;
  @HiveField(3)
  final int steps;

  WearableDataModel({
    required this.timestamp,
    required this.heartRate,
    required this.sleepHours,
    required this.steps,
  });

  factory WearableDataModel.fromJson(Map<String, dynamic> json) => _$WearableDataModelFromJson(json);
  Map<String, dynamic> toJson() => _$WearableDataModelToJson(this);
}
