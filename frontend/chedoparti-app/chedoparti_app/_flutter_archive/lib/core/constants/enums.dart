import 'package:freezed_annotation/freezed_annotation.dart';

enum AppRole {
  @JsonValue('user')
  user,

  @JsonValue('admin')
  admin,
}
