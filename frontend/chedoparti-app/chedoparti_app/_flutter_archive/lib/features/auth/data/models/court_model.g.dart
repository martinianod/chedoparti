// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'court_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_CourtModel _$CourtModelFromJson(Map<String, dynamic> json) => _CourtModel(
      id: json['id'] as String,
      name: json['name'] as String,
      pricePerHour: (json['pricePerHour'] as num).toDouble(),
      description: json['description'] as String?,
      isAvailable: json['isAvailable'] as bool?,
    );

Map<String, dynamic> _$CourtModelToJson(_CourtModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'pricePerHour': instance.pricePerHour,
      'description': instance.description,
      'isAvailable': instance.isAvailable,
    };
