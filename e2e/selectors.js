
export const AuthSelectors = {
  emailInput: 'input[placeholder="Email address"]',
  passwordInput: 'input[placeholder="Password"]',
  loginButton: 'button:has-text("Sign in")',
  errorMessage: '.auth-alert--error',
  termsText: '.auth-subtitle',
  createAccountLink: 'a[href="/register"]',
};

export const RegisterSelectors = {
  usernameInput: 'input[placeholder="Username (6-20 characters)"]',
  emailInput: 'input[placeholder="Email address"]',
  passwordInput: 'input[placeholder="Password (min 8 characters)"]',
  termsCheckbox: 'input[type="checkbox"]',
  submitButton: 'button:has-text("Create account")',
  errorMessage: '.auth-alert--error',
  signInLink: 'a[href="/login"]',
  successState: '.auth-success-state',
  captchaFrame: 'iframe[src*="recaptcha"]',
};

export const AccountRecoverySelectors = {
  emailInput: 'input[placeholder="Your email address"]',
  submitButton: 'button:has-text("Send reset link")',
  errorMessage: '.auth-alert--error',
  successMessage: '.auth-success-state',
  backToLoginLink: '.auth-back-link',
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

