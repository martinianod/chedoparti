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
  String get name;
  double get pricePerHour;
  String? get description;
  bool? get isAvailable;

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
            (identical(other.name, name) || other.name == name) &&
            (identical(other.pricePerHour, pricePerHour) ||
                other.pricePerHour == pricePerHour) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.isAvailable, isAvailable) ||
                other.isAvailable == isAvailable));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, name, pricePerHour, description, isAvailable);

  @override
  String toString() {
    return 'CourtModel(id: $id, name: $name, pricePerHour: $pricePerHour, description: $description, isAvailable: $isAvailable)';
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
      String name,
      double pricePerHour,
      String? description,
      bool? isAvailable});
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
    Object? name = null,
    Object? pricePerHour = null,
    Object? description = freezed,
    Object? isAvailable = freezed,
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
      pricePerHour: null == pricePerHour
          ? _self.pricePerHour
          : pricePerHour // ignore: cast_nullable_to_non_nullable
              as double,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      isAvailable: freezed == isAvailable
          ? _self.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _CourtModel implements CourtModel {
  _CourtModel(
      {required this.id,
      required this.name,
      required this.pricePerHour,
      this.description,
      this.isAvailable});
  factory _CourtModel.fromJson(Map<String, dynamic> json) =>
      _$CourtModelFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final double pricePerHour;
  @override
  final String? description;
  @override
  final bool? isAvailable;

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
            (identical(other.name, name) || other.name == name) &&
            (identical(other.pricePerHour, pricePerHour) ||
                other.pricePerHour == pricePerHour) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.isAvailable, isAvailable) ||
                other.isAvailable == isAvailable));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, name, pricePerHour, description, isAvailable);

  @override
  String toString() {
    return 'CourtModel(id: $id, name: $name, pricePerHour: $pricePerHour, description: $description, isAvailable: $isAvailable)';
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
      String name,
      double pricePerHour,
      String? description,
      bool? isAvailable});
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
    Object? name = null,
    Object? pricePerHour = null,
    Object? description = freezed,
    Object? isAvailable = freezed,
  }) {
    return _then(_CourtModel(
      id: null == id
          ? _self.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _self.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      pricePerHour: null == pricePerHour
          ? _self.pricePerHour
          : pricePerHour // ignore: cast_nullable_to_non_nullable
              as double,
      description: freezed == description
          ? _self.description
          : description // ignore: cast_nullable_to_non_nullable
              as String?,
      isAvailable: freezed == isAvailable
          ? _self.isAvailable
          : isAvailable // ignore: cast_nullable_to_non_nullable
              as bool?,
    ));
  }
}

// dart format on
