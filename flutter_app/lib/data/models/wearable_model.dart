import 'package:json_annotation/json_annotation.dart';

part 'wearable_model.g.dart';

@JsonSerializable()
class WearableDataModel {
  final String timestamp;
  final int heartRate;
  final double sleepHours;
  final int steps;

  WearableDataModel({
    required this.timestamp,
    required this.heartRate,
    required this.sleepHours,
    required this.steps,
  });

  factory WearableDataModel.fromJson(Map<String, dynamic> json) => _(json);
  Map<String, dynamic> toJson() => _(this);
}
