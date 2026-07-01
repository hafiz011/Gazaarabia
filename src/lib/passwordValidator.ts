/**
 * Password Validation & Security
 * Enforces strong password requirements
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 12,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
};

const SPECIAL_CHARS_REGEX = /[@$!%*?&]/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBERS_REGEX = /[0-9]/;

/**
 * Validate password strength
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`
    );
  }

  // Check for uppercase
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !UPPERCASE_REGEX.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)");
  }

  // Check for lowercase
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !LOWERCASE_REGEX.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)");
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !NUMBERS_REGEX.test(password)) {
    errors.push("Password must contain at least one number (0-9)");
  }

  // Check for special characters
  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS && !SPECIAL_CHARS_REGEX.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get human-readable password requirements message
 */
export function getPasswordRequirementsMessage(): string {
  const requirements: string[] = [];

  requirements.push(`At least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);

  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE) {
    requirements.push("At least one uppercase letter (A-Z)");
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE) {
    requirements.push("At least one lowercase letter (a-z)");
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS) {
    requirements.push("At least one number (0-9)");
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS) {
    requirements.push("At least one special character (@$!%*?&)");
  }

  return requirements.join(", ");
}

/**
 * Example passwords
 */
export const PASSWORD_EXAMPLES = {
  valid: [
    "SecurePass123!",
    "MyP@ssw0rd2024",
    "Complex$Pass123",
    "StrongPwd#2024",
  ],
  invalid: [
    "weak", // Too short, missing requirements
    "Weak123", // Missing special character
    "weakpassword!", // Missing uppercase and numbers
    "PASSWORD123!", // Missing lowercase
  ],
};
