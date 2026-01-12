import 'package:freezed_annotation/freezed_annotation.dart';

part 'court_model.freezed.dart';
part 'court_model.g.dart';

enum SurfaceType { syntheticGrass, hard, clay, carpet }
enum CourtType { indoor, outdoor, covered }

@freezed
abstract class CourtModel with _$CourtModel {
  const factory CourtModel({
    required String id,
    required String clubId,
    required String name,
    required String sport, // Padel, Tennis
    required SurfaceType surface,
    required CourtType type,
    @Default(true) bool hasLighting,
    @Default(0.0) double pricePerHour,
    List<String>? availableSlots, // Mocking slots here for simplicity: ["10:00", "11:30"]
  }) = _CourtModel;

  factory CourtModel.fromJson(Map<String, dynamic> json) => _$CourtModelFromJson(json);
}
