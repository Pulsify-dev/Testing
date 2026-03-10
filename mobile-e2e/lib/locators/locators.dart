/// locators.dart — Typed accessor for mobile-locators.json
///
/// Import this file in every Patrol test. Never embed raw key strings inside
/// test files directly — the custom lint rule `avoid_hardcoded_widget_keys`
/// (declared in analysis_options.yaml) will flag them as errors.
///
/// Usage:
/// ```dart
/// import 'package:pulsify_mobile_e2e/locators/locators.dart';
///
/// patrolTest('user can log in', ($) async {
///   await $(Key(MobileLocators.module1.loginScreen.emailField)).enterText('user@example.com');
///   await $(Key(MobileLocators.module1.loginScreen.submitButton)).tap();
/// });
/// ```
library locators;

// ---------------------------------------------------------------------------
// Module 1 — Auth
// ---------------------------------------------------------------------------

class _LoginScreenKeys {
  const _LoginScreenKeys();
  String get emailField          => 'login-email-field';
  String get passwordField       => 'login-password-field';
  String get submitButton        => 'login-submit-button';
  String get forgotPasswordLink  => 'login-forgot-password-link';
  String get registerLink        => 'login-register-link';
  String get errorBanner         => 'login-error-banner';
  String get googleSignInButton  => 'login-google-signin-button';
  String get appleSignInButton   => 'login-apple-signin-button';
  String get rememberMeSwitch    => 'login-remember-me-switch';
  String get loadingIndicator    => 'login-loading-indicator';
}

class _RegisterScreenKeys {
  const _RegisterScreenKeys();
  String get fullNameField        => 'register-full-name-field';
  String get usernameField        => 'register-username-field';
  String get emailField           => 'register-email-field';
  String get passwordField        => 'register-password-field';
  String get confirmPasswordField => 'register-confirm-password-field';
  String get dobField             => 'register-dob-field';
  String get termsCheckbox        => 'register-terms-checkbox';
  String get submitButton         => 'register-submit-button';
  String get loginLink            => 'register-login-link';
  String get passwordStrengthBar  => 'register-password-strength-bar';
  String get errorBanner          => 'register-error-banner';
  String get successSnackbar      => 'register-success-snackbar';
}

class _ForgotPasswordScreenKeys {
  const _ForgotPasswordScreenKeys();
  String get emailField        => 'forgot-email-field';
  String get submitButton      => 'forgot-submit-button';
  String get backButton        => 'forgot-back-button';
  String get confirmationText  => 'forgot-confirmation-text';
  String get errorBanner       => 'forgot-error-banner';
}

class _ResetPasswordScreenKeys {
  const _ResetPasswordScreenKeys();
  String get newPasswordField     => 'reset-new-password-field';
  String get confirmPasswordField => 'reset-confirm-password-field';
  String get submitButton         => 'reset-submit-button';
  String get successText          => 'reset-success-text';
  String get errorBanner          => 'reset-error-banner';
}

class _AuthSharedKeys {
  const _AuthSharedKeys();
  String get userAvatarButton     => 'nav-user-avatar-button';
  String get logoutMenuItem       => 'nav-logout-menu-item';
  String get sessionExpiredDialog => 'session-expired-dialog';
  String get sessionExpiredOkBtn  => 'session-expired-ok-button';
}

class _Module1Keys {
  const _Module1Keys();
  final loginScreen        = const _LoginScreenKeys();
  final registerScreen     = const _RegisterScreenKeys();
  final forgotPasswordScreen = const _ForgotPasswordScreenKeys();
  final resetPasswordScreen  = const _ResetPasswordScreenKeys();
  final shared             = const _AuthSharedKeys();
}

// ---------------------------------------------------------------------------
// Module 5 — Playback
// ---------------------------------------------------------------------------

class _MiniPlayerKeys {
  const _MiniPlayerKeys();
  String get playPauseButton => 'mini-player-play-pause-button';
  String get skipNextButton  => 'mini-player-skip-next-button';
  String get skipPrevButton  => 'mini-player-skip-prev-button';
  String get trackTitle      => 'mini-player-track-title';
  String get trackArtist     => 'mini-player-track-artist';
  String get albumArt        => 'mini-player-album-art';
  String get progressBar     => 'mini-player-progress-bar';
  String get expandButton    => 'mini-player-expand-button';
  String get likeButton      => 'mini-player-like-button';
}

class _FullscreenPlayerKeys {
  const _FullscreenPlayerKeys();
  String get albumArtLarge      => 'fullplayer-album-art';
  String get trackTitle         => 'fullplayer-track-title';
  String get trackArtist        => 'fullplayer-track-artist';
  String get albumName          => 'fullplayer-album-name';
  String get playPauseButton    => 'fullplayer-play-pause-button';
  String get skipNextButton     => 'fullplayer-skip-next-button';
  String get skipPrevButton     => 'fullplayer-skip-prev-button';
  String get progressSlider     => 'fullplayer-progress-slider';
  String get currentTimeLabel   => 'fullplayer-current-time';
  String get totalDurationLabel => 'fullplayer-total-duration';
  String get volumeSlider       => 'fullplayer-volume-slider';
  String get shuffleButton      => 'fullplayer-shuffle-button';
  String get repeatButton       => 'fullplayer-repeat-button';
  String get lyricsButton       => 'fullplayer-lyrics-button';
  String get lyricsPanel        => 'fullplayer-lyrics-panel';
  String get queueButton        => 'fullplayer-queue-button';
  String get shareButton        => 'fullplayer-share-button';
  String get closeButton        => 'fullplayer-close-button';
}

class _QueueSheetKeys {
  const _QueueSheetKeys();
  String get queueSheet        => 'queue-bottom-sheet';
  String get queueHeading      => 'queue-heading';
  String get queueList         => 'queue-list';
  String get queueItemTile     => 'queue-item-tile';
  String get queueItemRemoveBtn => 'queue-item-remove-button';
  String get clearQueueButton  => 'queue-clear-button';
  String get nowPlayingLabel   => 'queue-now-playing-label';

  /// Returns the ValueKey string for the n-th item in the queue (0-indexed).
  String itemAt(int index) => '$queueItemTile-$index';
}

class _TrackContextMenuKeys {
  const _TrackContextMenuKeys();
  String get contextSheet   => 'track-context-sheet';
  String get addToQueue     => 'track-context-add-to-queue';
  String get addToPlaylist  => 'track-context-add-to-playlist';
  String get goToAlbum      => 'track-context-go-to-album';
  String get goToArtist     => 'track-context-go-to-artist';
  String get shareTrack     => 'track-context-share';
}

class _Module5Keys {
  const _Module5Keys();
  final miniPlayer       = const _MiniPlayerKeys();
  final fullscreenPlayer = const _FullscreenPlayerKeys();
  final queueSheet       = const _QueueSheetKeys();
  final trackContextMenu = const _TrackContextMenuKeys();
}

// ---------------------------------------------------------------------------
// Root registry
// ---------------------------------------------------------------------------

/// Root accessor for all mobile widget key constants.
///
/// ```dart
/// import 'package:pulsify_mobile_e2e/locators/locators.dart';
///
/// final key = MobileLocators.module1.loginScreen.submitButton;
/// // → 'login-submit-button'
/// // Use as: $(Key(key))
/// ```
class MobileLocators {
  MobileLocators._();

  static const module1 = _Module1Keys();
  static const module5 = _Module5Keys();

  // Convenience aliases
  static const auth     = module1;
  static const playback = module5;
}
