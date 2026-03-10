// test_driver/patrol_test_driver.dart
//
// Patrol CLI test driver entry-point.
// This file is referenced automatically by `patrol test`; do not rename it.
// See: https://patrol.leancode.co/documentation/patrol-cli

import 'package:patrol/patrol.dart';

Future<void> main() async {
  await patrolAppService.init();
}
