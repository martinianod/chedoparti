import 'package:freezed_annotation/freezed_annotation.dart';

part 'club_model.freezed.dart';
part 'club_model.g.dart';

@freezed
abstract class ClubModel with _$ClubModel {
  const factory ClubModel({
    required String id,
    required String name,
    required String address,
    required String imageUrl,
    @Default(0.0) double rating,
    @Default(0) int reviewCount,
    @Default(0.0) double minPrice, // Starting from
    @Default([]) List<String> sports, // e.g. ['Padel', 'Tennis']
    @Default(false) bool isPromoted,
  }) = _ClubModel;

  factory ClubModel.fromJson(Map<String, dynamic> json) => _$ClubModelFromJson(json);
}
