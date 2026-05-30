const PASSWORD_COMPLEXITY_PATTERN = /(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_])/;

export const PASSWORD_MIN_LENGTH = 8;

export const validatePasswordStrength = (password: string): string | null => {
  if (!password.trim()) {
    return 'Password is required.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return 'Password must be at least 8 characters long.';
  }

  if (!PASSWORD_COMPLEXITY_PATTERN.test(password)) {
    return 'Password must include uppercase, lowercase, a number, and a symbol.';
  }

  return null;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
  mismatchMessage = 'Password and confirmation must match.',
): string | null => {
  if (password !== confirmPassword) {
    return mismatchMessage;
  }

  return null;
};
