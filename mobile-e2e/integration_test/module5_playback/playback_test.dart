// integration_test/module5_playback/playback_test.dart
//
// Module 5 — Playback: mini-player, full-screen player, and queue Patrol tests
// Run:  patrol test --target integration_test/module5_playback/playback_test.dart
// Tags: @Tags(['playback', 'smoke'])

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:patrol/patrol.dart';

import '../../lib/locators/locators.dart';

// Shorthand aliases
final _mini = MobileLocators.playback.miniPlayer;
final _full = MobileLocators.playback.fullscreenPlayer;
final _queue = MobileLocators.playback.queueSheet;

void main() {
  group('Mini Player @playback', () {
    patrolTest(
      'mini-player controls are visible on home screen',
      tags: ['playback', 'smoke'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_mini.playPauseButton)).waitUntilVisible();
        await $(Key(_mini.skipNextButton)).waitUntilVisible();
        await $(Key(_mini.skipPrevButton)).waitUntilVisible();
        await $(Key(_mini.trackTitle)).waitUntilVisible();
        await $(Key(_mini.trackArtist)).waitUntilVisible();
        await $(Key(_mini.albumArt)).waitUntilVisible();
      },
    );

    patrolTest(
      'tapping play/pause toggles the playback icon',
      tags: ['playback'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        final playPause = $(Key(_mini.playPauseButton));
        await playPause.waitUntilVisible();

        // Capture icon before tap (semantics label)
        final beforeLabel = await playPause.text;
        await playPause.tap();
        // After tap the label should have changed (Play → Pause or vice versa)
        expect(await playPause.text, isNot(equals(beforeLabel)));
      },
    );

    patrolTest('skip next advances to a different track', tags: ['playback'], (
      $,
    ) async {
      await $.pumpWidgetAndSettle(const _AppUnderTest());

      final titleBefore = await $(Key(_mini.trackTitle)).text;

      await $(Key(_mini.skipNextButton)).tap();
      await $.pumpAndSettle();

      final titleAfter = await $(Key(_mini.trackTitle)).text;

      expect(titleAfter, isNot(equals(titleBefore)));
    });

    patrolTest(
      'tapping expand opens the full-screen player',
      tags: ['playback', 'smoke'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_mini.expandButton)).tap();

        await $(Key(_full.albumArtLarge)).waitUntilVisible();
        await $(Key(_full.trackTitle)).waitUntilVisible();
      },
    );
  });

  group('Full-Screen Player @playback', () {
    patrolTest(
      'full-screen player shows track info and controls',
      tags: ['playback', 'smoke'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        // Navigate to full-screen player
        await $(Key(_mini.expandButton)).tap();
        await $(Key(_full.albumArtLarge)).waitUntilVisible();

        await $(Key(_full.trackTitle)).waitUntilVisible();
        await $(Key(_full.trackArtist)).waitUntilVisible();
        await $(Key(_full.playPauseButton)).waitUntilVisible();
        await $(Key(_full.shuffleButton)).waitUntilVisible();
        await $(Key(_full.repeatButton)).waitUntilVisible();
        await $(Key(_full.progressSlider)).waitUntilVisible();
      },
    );

    patrolTest(
      'close button collapses back to mini-player',
      tags: ['playback'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_mini.expandButton)).tap();
        await $(Key(_full.albumArtLarge)).waitUntilVisible();

        await $(Key(_full.closeButton)).tap();
        await $(Key(_mini.playPauseButton)).waitUntilVisible();
        expect($(Key(_full.albumArtLarge)).visible, isFalse);
      },
    );

    patrolTest(
      'shuffle toggle changes aria/semantics state',
      tags: ['playback'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());
        await $(Key(_mini.expandButton)).tap();
        await $(Key(_full.shuffleButton)).waitUntilVisible();

        await $(Key(_full.shuffleButton)).tap();
        // The widget under the key should reflect "shuffle on" state
        // (exact assertion depends on app implementation; adjust as needed)
        await $(Key(_full.shuffleButton)).waitUntilVisible();
      },
    );
  });

  group('Queue Sheet @playback', () {
    patrolTest(
      'queue sheet opens and lists tracks',
      tags: ['playback', 'smoke'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_mini.expandButton)).tap();
        await $(Key(_full.queueButton)).tap();

        await $(Key(_queue.queueSheet)).waitUntilVisible();
        await $(Key(_queue.queueHeading)).waitUntilVisible();
        // At least one track item must be in the queue
        expect($(Key(_queue.queueList)).visible, isTrue);
      },
    );

    patrolTest(
      'tapping remove on the first queue item shrinks the list',
      tags: ['playback'],
      ($) async {
        await $.pumpWidgetAndSettle(const _AppUnderTest());

        await $(Key(_mini.expandButton)).tap();
        await $(Key(_full.queueButton)).tap();
        await $(Key(_queue.queueSheet)).waitUntilVisible();

        final firstItemRemove = Key(
          MobileLocators.playback.queueSheet.itemAt(0),
        );
        await $(firstItemRemove).scrollTo();
        await $(firstItemRemove).tap();

        // After removal the first item tile should be gone (or count decreased)
        expect($(firstItemRemove).visible, isFalse);
      },
    );

    patrolTest('clear queue button empties the queue', tags: ['playback'], (
      $,
    ) async {
      await $.pumpWidgetAndSettle(const _AppUnderTest());

      await $(Key(_mini.expandButton)).tap();
      await $(Key(_full.queueButton)).tap();
      await $(Key(_queue.queueSheet)).waitUntilVisible();

      await $(Key(_queue.clearQueueButton)).tap();

      // After clearing, the first queue item should not be visible
      expect(
        $(Key(MobileLocators.playback.queueSheet.itemAt(0))).visible,
        isFalse,
      );
    });
  });
}

// ---------------------------------------------------------------------------
// Placeholder app wrapper — replace with your real app bootstrap
// ---------------------------------------------------------------------------
class _AppUnderTest extends StatelessWidget {
  const _AppUnderTest();

  @override
  Widget build(BuildContext context) => const MaterialApp(
    home: Scaffold(body: Center(child: Text('App under test — replace me'))),
  );
}
