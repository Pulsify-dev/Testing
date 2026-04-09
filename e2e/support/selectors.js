
export const AuthSelectors = {
  emailInput: 'input[placeholder="Email address"]',
  passwordInput: 'input[placeholder="Password"]',
  loginButton: 'button:has-text("Sign in")',
  errorMessage: '.auth-alert--error',
  successMessage: '.auth-alert--success',
  termsText: '.auth-subtitle',
  createAccountLink: '.auth-footer-row a[href="/register"]',
  forgotPasswordLink: '.auth-footer-row a[href="/forgot-password"]',
  loginLinks: 'a[href="/login"]',
  oauthButtons: '.auth-oauth-btn',
  oauthGoogleButton: 'button:has-text("Continue with Google")',
  oauthFacebookButton: 'button:has-text("Continue with Facebook")',
  oauthAppleButton: 'button:has-text("Continue with Apple")',
};

export const RegisterSelectors = {
  usernameInput: 'input[placeholder="Username (6-20 characters)"]',
  emailInput: 'input[placeholder="Email address"]',
  passwordInput: 'input[placeholder="Password (min 8 characters)"]',
  usernameHintError: '.auth-field-hint--error',
  termsCheckbox: 'input[type="checkbox"]',
  submitButton: 'button:has-text("Create account")',
  errorMessage: '.auth-alert--error',
  successMessage: '.auth-alert--success',
  signInLink: '.auth-footer-row a[href="/login"]',
  signInLinks: 'a[href="/login"]',
  socialButtons: '.auth-oauth-btn',
  successState: '.auth-success-state',
  captchaFrame: 'iframe[src*="recaptcha"]',
  checkEmailTitle: 'h1:has-text("Check your email")',
  checkEmailHint: '.auth-email-display',
  resendVerificationLink: 'button:has-text("Resend"), a:has-text("Resend"), button:has-text("resend"), a:has-text("resend")',
};

export const AccountRecoverySelectors = {
  emailInput: 'input[placeholder="Your email address"]',
  submitButton: 'button:has-text("Send reset link")',
  errorMessage: '.auth-alert--error',
  successMessage: '.auth-success-state',
  backToLoginLink: '.auth-back-link',
  loginLinks: 'a[href="/login"]',
};

export const ProfileSelectors = {
  profilePage: '.sc-profile-page',
  profileCard: '.sc-profile-card',
  displayNameHeading: '.sc-display-name',
  locationText: '.sc-location',
  followersLabel: '.sc-stat-label:has-text("Followers")',
  followingLabel: '.sc-stat-label:has-text("Following")',
  editButton: '.sc-edit-btn',
  editModal: '.sc-modal',
  editTitle: '.sc-edit-title',
  editTextInputs: '.sc-modal input.sc-edit-input',
  bioInput: '.sc-edit-textarea',
  addLinkButton: '.sc-add-link-btn',
  linkInputs: '.sc-edit-link-input',
  socialLinks: '.sc-social-link',
  saveButton: '.sc-save-btn',
  cancelButton: '.sc-cancel-btn',
  avatarUpload: '.sc-edit-avatar-overlay input[type="file"]',
  coverUpload: '.sc-edit-cover-input',
};

