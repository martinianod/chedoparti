// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'club_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ClubModel _$ClubModelFromJson(Map<String, dynamic> json) => _ClubModel(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      imageUrl: json['imageUrl'] as String?,
    );

Map<String, dynamic> _$ClubModelToJson(_ClubModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'address': instance.address,
      'imageUrl': instance.imageUrl,
    };
