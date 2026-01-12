// dart format width=80
// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'court_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;

/// @nodoc
mixin _$CourtModel {
  String get id;
  String get clubId;
  String get name;
  String get sport; // Padel, Tennis
  SurfaceType get surface;
  CourtType get type;
  bool get hasLighting;
  double get pricePerHour;
  List<String>? get availableSlots;

  /// Create a copy of CourtModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  $CourtModelCopyWith<CourtModel> get copyWith =>
      _$CourtModelCopyWithImpl<CourtModel>(this as CourtModel, _$identity);

  /// Serializes this CourtModel to a JSON map.
  Map<String, dynamic> toJson();

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is CourtModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.clubId, clubId) || other.clubId == clubId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.sport, sport) || other.sport == sport) &&
            (identical(other.surface, surface) || other.surface == surface) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.hasLighting, hasLighting) ||
                other.hasLighting == hasLighting) &&
            (identical(other.pricePerHour, pricePerHour) ||
                other.pricePerHour == pricePerHour) &&
            const DeepCollectionEquality()
                .equals(other.availableSlots, availableSlots));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      clubId,
      name,
      sport,
      surface,
      type,
      hasLighting,
      pricePerHour,
      const DeepCollectionEquality().hash(availableSlots));

  @override
  String toString() {
    return 'CourtModel(id: $id, clubId: $clubId, name: $name, sport: $sport, surface: $surface, type: $type, hasLighting: $hasLighting, pricePerHour: $pricePerHour, availableSlots: $availableSlots)';
  }
}

/// @nodoc
abstract mixin class $CourtModelCopyWith<$Res> {
  factory $CourtModelCopyWith(
          CourtModel value, $Res Function(CourtModel) _then) =
      _$CourtModelCopyWithImpl;
  @useResult
  $Res call(
      {String id,
      String clubId,
      String name,
      String sport,
      SurfaceType surface,
      CourtType type,
      bool hasLighting,
      double pricePerHour,
      List<String>? availableSlots});
}

/// @nodoc
class _$CourtModelCopyWithImpl<$Res> implements $CourtModelCopyWith<$Res> {
  _$CourtModelCopyWithImpl(this._self, this._then);

  final CourtModel _self;
  final $Res Function(CourtModel) _then;

  /// Create a copy of CourtModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? clubId = null,
    Object? name = null,
    Object? sport = null,
    Object? surface = null,
    Object? type = null,
    Object? hasLighting = null,
    Object? pricePerHour = null,
    Object? availableSlots = freezed,
  }) {
    return _then(_self.copyWith(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      clubId: null == clubId
          ? _self.clubId
          : clubId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      sport: null == sport
          ? _self.sport
          : sport // ignore: cast_nullable_to_non_nullable
              as String,
      surface: null == surface
          ? _self.surface
          : surface // ignore: cast_nullable_to_non_nullable
              as SurfaceType,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as CourtType,
      hasLighting: null == hasLighting
          ? _self.hasLighting
          : hasLighting // ignore: cast_nullable_to_non_nullable
              as bool,
      pricePerHour: null == pricePerHour
          ? _self.pricePerHour
          : pricePerHour // ignore: cast_nullable_to_non_nullable
              as double,
      availableSlots: freezed == availableSlots
          ? _self.availableSlots
          : availableSlots // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _CourtModel implements CourtModel {
  const _CourtModel(
      {required this.id,
      required this.clubId,
      required this.name,
      required this.sport,
      required this.surface,
      required this.type,
      this.hasLighting = true,
      this.pricePerHour = 0.0,
      final List<String>? availableSlots})
      : _availableSlots = availableSlots;
  factory _CourtModel.fromJson(Map<String, dynamic> json) =>
      _$CourtModelFromJson(json);

  @override
  final String id;
  @override
  final String clubId;
  @override
  final String name;
  @override
  final String sport;
// Padel, Tennis
  @override
  final SurfaceType surface;
  @override
  final CourtType type;
  @override
  @JsonKey()
  final bool hasLighting;
  @override
  @JsonKey()
  final double pricePerHour;
  final List<String>? _availableSlots;
  @override
  List<String>? get availableSlots {
    final value = _availableSlots;
    if (value == null) return null;
    if (_availableSlots is EqualUnmodifiableListView) return _availableSlots;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  /// Create a copy of CourtModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  @pragma('vm:prefer-inline')
  _$CourtModelCopyWith<_CourtModel> get copyWith =>
      __$CourtModelCopyWithImpl<_CourtModel>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$CourtModelToJson(
      this,
    );
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _CourtModel &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.clubId, clubId) || other.clubId == clubId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.sport, sport) || other.sport == sport) &&
            (identical(other.surface, surface) || other.surface == surface) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.hasLighting, hasLighting) ||
                other.hasLighting == hasLighting) &&
            (identical(other.pricePerHour, pricePerHour) ||
                other.pricePerHour == pricePerHour) &&
            const DeepCollectionEquality()
                .equals(other._availableSlots, _availableSlots));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      clubId,
      name,
      sport,
      surface,
      type,
      hasLighting,
      pricePerHour,
      const DeepCollectionEquality().hash(_availableSlots));

  @override
  String toString() {
    return 'CourtModel(id: $id, clubId: $clubId, name: $name, sport: $sport, surface: $surface, type: $type, hasLighting: $hasLighting, pricePerHour: $pricePerHour, availableSlots: $availableSlots)';
  }
}

/// @nodoc
abstract mixin class _$CourtModelCopyWith<$Res>
    implements $CourtModelCopyWith<$Res> {
  factory _$CourtModelCopyWith(
          _CourtModel value, $Res Function(_CourtModel) _then) =
      __$CourtModelCopyWithImpl;
  @override
  @useResult
  $Res call(
      {String id,
      String clubId,
      String name,
      String sport,
      SurfaceType surface,
      CourtType type,
      bool hasLighting,
      double pricePerHour,
      List<String>? availableSlots});
}

/// @nodoc
class __$CourtModelCopyWithImpl<$Res> implements _$CourtModelCopyWith<$Res> {
  __$CourtModelCopyWithImpl(this._self, this._then);

  final _CourtModel _self;
  final $Res Function(_CourtModel) _then;

  /// Create a copy of CourtModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $Res call({
    Object? id = null,
    Object? clubId = null,
    Object? name = null,
    Object? sport = null,
    Object? surface = null,
    Object? type = null,
    Object? hasLighting = null,
    Object? pricePerHour = null,
    Object? availableSlots = freezed,
  }) {
    return _then(_CourtModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      clubId: null == clubId
          ? _self.clubId
          : clubId // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      sport: null == sport
          ? _self.sport
          : sport // ignore: cast_nullable_to_non_nullable
              as String,
      surface: null == surface
          ? _self.surface
          : surface // ignore: cast_nullable_to_non_nullable
              as SurfaceType,
      type: null == type
          ? _self.type
          : type // ignore: cast_nullable_to_non_nullable
              as CourtType,
      hasLighting: null == hasLighting
          ? _self.hasLighting
          : hasLighting // ignore: cast_nullable_to_non_nullable
              as bool,
      pricePerHour: null == pricePerHour
          ? _self.pricePerHour
          : pricePerHour // ignore: cast_nullable_to_non_nullable
              as double,
      availableSlots: freezed == availableSlots
          ? _self._availableSlots
          : availableSlots // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

// dart format on
