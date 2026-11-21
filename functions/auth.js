export { handleGoogleLogin } from './auth/google.js';
export {
  getAuthConfig,
  handleForgotPassword,
  handleLogin,
  handleLogout,
  handleRegister,
  handleResetPassword,
  handleVerifyEmail,
} from './auth/handlers.js';
export { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from './auth/password.js';
export {
  clearSessionCookie,
  getSessionCookieName,
  getSessionSecret,
  getSessionUser,
  isCrossSiteCookie,
  parseCookies,
  setSessionCookie,
  validateSessionConfig,
} from './auth/session.js';
