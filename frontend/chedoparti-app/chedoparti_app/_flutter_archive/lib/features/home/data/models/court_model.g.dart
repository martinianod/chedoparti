// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'court_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CourtModel _$CourtModelFromJson(Map<String, dynamic> json) => _CourtModel(
      id: json['id'] as String,
      clubId: json['clubId'] as String,
      name: json['name'] as String,
      sport: json['sport'] as String,
      surface: $enumDecode(_$SurfaceTypeEnumMap, json['surface']),
      type: $enumDecode(_$CourtTypeEnumMap, json['type']),
      hasLighting: json['hasLighting'] as bool? ?? true,
      pricePerHour: (json['pricePerHour'] as num?)?.toDouble() ?? 0.0,
      availableSlots: (json['availableSlots'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$CourtModelToJson(_CourtModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'clubId': instance.clubId,
      'name': instance.name,
      'sport': instance.sport,
      'surface': _$SurfaceTypeEnumMap[instance.surface]!,
      'type': _$CourtTypeEnumMap[instance.type]!,
      'hasLighting': instance.hasLighting,
      'pricePerHour': instance.pricePerHour,
      'availableSlots': instance.availableSlots,
    };

const _$SurfaceTypeEnumMap = {
  SurfaceType.syntheticGrass: 'syntheticGrass',
  SurfaceType.hard: 'hard',
  SurfaceType.clay: 'clay',
  SurfaceType.carpet: 'carpet',
};

const _$CourtTypeEnumMap = {
  CourtType.indoor: 'indoor',
  CourtType.outdoor: 'outdoor',
  CourtType.covered: 'covered',
};
