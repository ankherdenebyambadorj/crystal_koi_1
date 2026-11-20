export const FORM_LIMITS = {
  fullNameMax: 100,
  emailMax: 254,
  phoneMin: 6,
  phoneMax: 20,
  companyMax: 120,
  messageMax: 2000,
  reasonMax: 500,
  sourcePathMax: 100,
  passwordMin: 8,
  passwordMax: 128,
  codeLength: 6,
};

export const PHONE_PATTERN = /^[+\d\s().-]{6,20}$/;

export function sanitizeInternalNextPath(rawPath, fallback = '/') {
  if (typeof rawPath !== 'string') return fallback;
  const trimmed = rawPath.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return fallback;
  }
  return trimmed;
}
