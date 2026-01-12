// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'club_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_ClubModel _$ClubModelFromJson(Map<String, dynamic> json) => _ClubModel(
      id: json['id'] as String,
      name: json['name'] as String,
      address: json['address'] as String,
      imageUrl: json['imageUrl'] as String,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      minPrice: (json['minPrice'] as num?)?.toDouble() ?? 0.0,
      sports: (json['sports'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      isPromoted: json['isPromoted'] as bool? ?? false,
    );

Map<String, dynamic> _$ClubModelToJson(_ClubModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'address': instance.address,
      'imageUrl': instance.imageUrl,
      'rating': instance.rating,
      'reviewCount': instance.reviewCount,
      'minPrice': instance.minPrice,
      'sports': instance.sports,
      'isPromoted': instance.isPromoted,
    };
