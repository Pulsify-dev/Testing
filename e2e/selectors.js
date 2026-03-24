
export const AuthSelectors = {
  emailInput:     'input[type="email"]',
  passwordInput:  'input[name="password"]',
  loginButton:    '.auth-submit-btn',
  errorMessage:   '.auth-alert--error',
  termsText:      '.auth-terms',
  createAccountLink: 'a[href="/register"]',
};

export const RegisterSelectors = {
  emailInput:           'input[placeholder="Email address"]',
  passwordInput:        'input[placeholder="Password (min 6 characters)"]',
  confirmPasswordInput: 'input[placeholder="Confirm password"]',
  displayNameInput:     'input[placeholder="Display name"]',
  termsCheckbox:        'input[type="checkbox"]',
  submitButton:         '.auth-submit-btn',
  errorMessage:         '.auth-alert--error',
  signInLink:           'a[href="/login"]',
};

export const AccountRecoverySelectors = {
  emailInput:     'input[type="email"]',
  submitButton:   '.auth-submit-btn',
  errorMessage:   '.auth-alert--error',
  successMessage: '.auth-success-state',
  backToLoginLink: 'a[href="/login"]:has-text("Sign in")',
};

export const ProfileSelectors = {
  profileCard:      '.profile-card',
  displayNameHeading: '.profile-card h1',
  accountTier:      'p:has-text("Account Tier:")',
  privacyStatus:    'p:has-text("Privacy:")',
  genreTags:        '.genre-tag',
  socialLinks:      '.social-links',
  displayNameInput: '#displayName',
  bioInput:         '#bio',
  locationInput:    '#location',
  genresInput:      '#genres',
  instagramInput:   '#instagram',
  twitterInput:     '#twitter',
  websiteInput:     '#website',
  privacySelect:    '#privacy',
  avatarUpload:     '#avatar',
  coverUpload:      '#cover',
  saveButton:       'button[type="submit"]',
};

