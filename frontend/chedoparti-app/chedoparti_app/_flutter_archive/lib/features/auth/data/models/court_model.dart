import 'package:freezed_annotation/freezed_annotation.dart';

part 'court_model.freezed.dart';
part 'court_model.g.dart';

@freezed
class CourtModel with _$CourtModel {
  factory CourtModel({
    required String id,
    required String name,
    required double pricePerHour,
    String? description,
    bool? isAvailable,
  }) = _CourtModel;

  factory CourtModel.fromJson(Map<String, dynamic> json) =>
      _$CourtModelFromJson(json);

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}
