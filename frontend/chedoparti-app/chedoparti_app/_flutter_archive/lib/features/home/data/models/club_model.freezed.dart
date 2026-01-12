// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'club_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$ClubModel {
  String get id;
  String get name;
  String get address;
  String get imageUrl;
  double get rating;
  int get reviewCount;
  double get minPrice; // Starting from
  List<String> get sports; // e.g. ['Padel', 'Tennis']
  bool get isPromoted;

  /// Create a copy of ClubModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $ClubModelCopyWith<ClubModel> get copyWith =>
      _$ClubModelCopyWithImpl<ClubModel>(this as ClubModel, _$identity);

  /// Serializes this ClubModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is ClubModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.rating, rating) || other.rating == rating) &&
            (identical(other.reviewCount, reviewCount) ||
                other.reviewCount == reviewCount) &&
            (identical(other.minPrice, minPrice) ||
                other.minPrice == minPrice) &&
            const DeepCollectionEquality().equals(other.sports, sports) &&
            (identical(other.isPromoted, isPromoted) ||
                other.isPromoted == isPromoted));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      address,
      imageUrl,
      rating,
      reviewCount,
      minPrice,
      const DeepCollectionEquality().hash(sports),
      isPromoted);

  @override
  String toString() {
    return 'ClubModel(id: $id, name: $name, address: $address, imageUrl: $imageUrl, rating: $rating, reviewCount: $reviewCount, minPrice: $minPrice, sports: $sports, isPromoted: $isPromoted)';
  }
}

/// @nodoc
abstract mixin class $ClubModelCopyWith<$Res> {
  factory $ClubModelCopyWith(ClubModel value, $Res Function(ClubModel) _then) =
      _$ClubModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String name,
      String address,
      String imageUrl,
      double rating,
      int reviewCount,
      double minPrice,
      List<String> sports,
      bool isPromoted});
}

/// @nodoc
class _$ClubModelCopyWithImpl<$Res> implements $ClubModelCopyWith<$Res> {
  _$ClubModelCopyWithImpl(this._self, this._then);

  final ClubModel _self;
  final $Res Function(ClubModel) _then;

  /// Create a copy of ClubModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? address = null,
    Object? imageUrl = null,
    Object? rating = null,
    Object? reviewCount = null,
    Object? minPrice = null,
    Object? sports = null,
    Object? isPromoted = null,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      address: null == address
          ? _self.address
          : address // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: null == imageUrl
          ? _self.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String,
      rating: null == rating
          ? _self.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as double,
      reviewCount: null == reviewCount
          ? _self.reviewCount
          : reviewCount // ignore: cast_nullable_to_non_nullable
              as int,
      minPrice: null == minPrice
          ? _self.minPrice
          : minPrice // ignore: cast_nullable_to_non_nullable
              as double,
      sports: null == sports
          ? _self.sports
          : sports // ignore: cast_nullable_to_non_nullable
              as List<String>,
      isPromoted: null == isPromoted
          ? _self.isPromoted
          : isPromoted // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _ClubModel implements ClubModel {
  const _ClubModel(
      {required this.id,
      required this.name,
      required this.address,
      required this.imageUrl,
      this.rating = 0.0,
      this.reviewCount = 0,
      this.minPrice = 0.0,
      final List<String> sports = const [],
      this.isPromoted = false})
      : _sports = sports;
  factory _ClubModel.fromJson(Map<String, dynamic> json) =>
      _$ClubModelFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String address;
  @override
  final String imageUrl;
  @override
  @JsonKey()
  final double rating;
  @override
  @JsonKey()
  final int reviewCount;
  @override
  @JsonKey()
  final double minPrice;
// Starting from
  final List<String> _sports;
// Starting from
  @override
  @JsonKey()
  List<String> get sports {
    if (_sports is EqualUnmodifiableListView) return _sports;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_sports);
  }

// e.g. ['Padel', 'Tennis']
  @override
  @JsonKey()
  final bool isPromoted;

  /// Create a copy of ClubModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$ClubModelCopyWith<_ClubModel> get copyWith =>
      __$ClubModelCopyWithImpl<_ClubModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$ClubModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _ClubModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.rating, rating) || other.rating == rating) &&
            (identical(other.reviewCount, reviewCount) ||
                other.reviewCount == reviewCount) &&
            (identical(other.minPrice, minPrice) ||
                other.minPrice == minPrice) &&
            const DeepCollectionEquality().equals(other._sports, _sports) &&
            (identical(other.isPromoted, isPromoted) ||
                other.isPromoted == isPromoted));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      address,
      imageUrl,
      rating,
      reviewCount,
      minPrice,
      const DeepCollectionEquality().hash(_sports),
      isPromoted);

  @override
  String toString() {
    return 'ClubModel(id: $id, name: $name, address: $address, imageUrl: $imageUrl, rating: $rating, reviewCount: $reviewCount, minPrice: $minPrice, sports: $sports, isPromoted: $isPromoted)';
  }
}

/// @nodoc
abstract mixin class _$ClubModelCopyWith<$Res>
    implements $ClubModelCopyWith<$Res> {
  factory _$ClubModelCopyWith(
          _ClubModel value, $Res Function(_ClubModel) _then) =
      __$ClubModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String address,
      String imageUrl,
      double rating,
      int reviewCount,
      double minPrice,
      List<String> sports,
      bool isPromoted});
}

/// @nodoc
class __$ClubModelCopyWithImpl<$Res> implements _$ClubModelCopyWith<$Res> {
  __$ClubModelCopyWithImpl(this._self, this._then);

  final _ClubModel _self;
  final $Res Function(_ClubModel) _then;

  /// Create a copy of ClubModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? address = null,
    Object? imageUrl = null,
    Object? rating = null,
    Object? reviewCount = null,
    Object? minPrice = null,
    Object? sports = null,
    Object? isPromoted = null,
  }) {
    return _then(_ClubModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      address: null == address
          ? _self.address
          : address // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: null == imageUrl
          ? _self.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String,
      rating: null == rating
          ? _self.rating
          : rating // ignore: cast_nullable_to_non_nullable
              as double,
      reviewCount: null == reviewCount
          ? _self.reviewCount
          : reviewCount // ignore: cast_nullable_to_non_nullable
              as int,
      minPrice: null == minPrice
          ? _self.minPrice
          : minPrice // ignore: cast_nullable_to_non_nullable
              as double,
      sports: null == sports
          ? _self._sports
          : sports // ignore: cast_nullable_to_non_nullable
              as List<String>,
      isPromoted: null == isPromoted
          ? _self.isPromoted
          : isPromoted // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

// dart format on
