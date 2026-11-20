import { invokeApi } from './invokeFunction.js';

export function fetchPartners() {
  return invokeApi('/api/fn/getPartners', { method: 'GET' });
}

export function fetchStories() {
  return invokeApi('/api/fn/getStories', { method: 'GET' });
}

export function fetchServiceStatus() {
  return invokeApi('/api/fn/getServiceStatus', { method: 'GET' });
}

export function fetchAuthMe() {
  return invokeApi('/api/auth/me', { method: 'GET' });
}

export function loginWithPassword(payload) {
  return invokeApi('/api/auth/login', { method: 'POST', body: payload });
}

export function registerAccount(payload) {
  return invokeApi('/api/auth/register', { method: 'POST', body: payload });
}

export function verifyEmailCode(payload) {
  return invokeApi('/api/auth/verify-email', { method: 'POST', body: payload });
}

export function requestPasswordReset(payload) {
  return invokeApi('/api/auth/forgot-password', { method: 'POST', body: payload });
}

export function confirmPasswordReset(payload) {
  return invokeApi('/api/auth/reset-password', { method: 'POST', body: payload });
}

export function loginWithGoogleToken(credential) {
  return invokeApi('/api/auth/google', { method: 'POST', body: { credential } });
}

export function logoutSession() {
  return invokeApi('/api/auth/logout', { method: 'POST', body: {} });
}
