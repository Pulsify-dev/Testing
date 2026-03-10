// integration_test/module1_auth/login_test.dart
//
// Module 1 — Auth: Login screen Patrol tests
// Run:  patrol test --target integration_test/module1_auth/login_test.dart
// Tags: @Tags(['auth', 'smoke'])

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import '../../lib/locators/locators.dart';

// Shorthand alias so test bodies stay terse.
final _l = MobileLocators.auth.loginScreen;

void main() {
  group('Login Screen @auth', () {
    patrolTest('renders all required login fields', tags: ['auth', 'smoke'], (
      $,
    ) async {
      await $.pumpWidgetAndSettle(const _AppUnderTest());

      await $(_l.emailField).waitUntilVisible();
      await $(_l.passwordField).waitUntilVisible();
      await $(_l.submitButton).waitUntilVisible();
      await $(_l.forgotPasswordLink).waitUntilVisible();
      await $(_l.registerLink).waitUntilVisible();
    });

    patrolTest('shows error banner on invalid credentials', tags: ['auth'], (
      $,
    ) async {
      await $.pumpWidgetAndSettle(const _AppUnderTest());

      await $(Key(_l.emailField)).enterText('notauser@example.com');
      await $(Key(_l.passwordField)).enterText('wrongpassword');
      await $(Key(_l.submitButton)).tap();

      await $(Key(_l.errorBanner)).waitUntilVisible();
    });

    patrolTest(
      'navigates to registration screen via register link',
      tags: ['auth', 'smoke'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_l.registerLink)).tap();

        await $(
          Key(MobileLocators.auth.registerScreen.submitButton),
        ).waitUntilVisible();
      },
    );

    patrolTest('navigates to forgot-password screen', tags: ['auth'], (
      $,
    ) async {
      await $.pumpWidgetAndSettle(const _AppUnderTest());

      await $(Key(_l.forgotPasswordLink)).tap();

      await $(
        Key(MobileLocators.auth.forgotPasswordScreen.submitButton),
      ).waitUntilVisible();
    });

    patrolTest(
      'shows loading indicator during authentication request',
      tags: ['auth'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_l.emailField)).enterText('test@pulsify.dev');
        await $(Key(_l.passwordField)).enterText('Test@1234');
        await $(Key(_l.submitButton)).tap();

        // Loading indicator should appear immediately after tap
        await $(Key(_l.loadingIndicator)).waitUntilVisible();
      },
    );

    patrolTest(
      'redirects to home after successful login',
      tags: ['auth', 'smoke'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_l.emailField)).enterText(
          const String.fromEnvironment(
            'TEST_USER_EMAIL',
            defaultValue: 'test@pulsify.dev',
          ),
        );
        await $(Key(_l.passwordField)).enterText(
          const String.fromEnvironment(
            'TEST_USER_PASSWORD',
            defaultValue: 'Test@1234',
          ),
        );
        await $(Key(_l.submitButton)).tap();

        // After login the mini-player shell (and user avatar) should be visible
        await $(
          Key(MobileLocators.auth.shared.userAvatarButton),
        ).waitUntilVisible();
      },
    );
  });
}

// ---------------------------------------------------------------------------
// Placeholder app wrapper
// Replace with the real app entry-point or a test harness that bootstraps
// the app router when running against the actual app binary via Patrol.
// ---------------------------------------------------------------------------
class _AppUnderTest extends StatelessWidget {
  const _AppUnderTest();

  @override
  Widget build(BuildContext context) => const MaterialApp(
    home: Scaffold(body: Center(child: Text('App under test — replace me'))),
  );
}
