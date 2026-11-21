// Unified thin repository layer selecting PostgreSQL (DATABASE_URL) or local SQLite
import { pgRepository } from './repository/pgRepo.js';
import { sqliteRepository } from './repository/sqliteRepo.js';

let customRepository = null;

export function setRepository(repo) {
  customRepository = repo;
}

export function getRepository() {
  if (customRepository) return customRepository;
  return process.env.DATABASE_URL ? pgRepository : sqliteRepository;
}

export const initStore = () => getRepository().initStore();
export const findIntakeByRequestId = (k, id) => getRepository().findIntakeByRequestId(k, id);
export const countRecentByEmail = (e, s) => getRepository().countRecentByEmail(e, s);
export const countRecentByKind = (k, s) => getRepository().countRecentByKind(k, s);
export const insertIntake = (k, r) => getRepository().insertIntake(k, r);
export const getPublishedPartners = () => getRepository().getPublishedPartners();
export const getPublishedStories = () => getRepository().getPublishedStories();
export const getPublishedServiceStatus = (s) => getRepository().getPublishedServiceStatus(s);
export const findUserByEmail = (e) => getRepository().findUserByEmail(e);
export const findUserByGoogleOrEmail = (sub, e) => getRepository().findUserByGoogleOrEmail(sub, e);
export const findUserById = (id) => getRepository().findUserById(id);
export const createUser = (u) => getRepository().createUser(u);
export const updateUnverifiedUser = (id, d) => getRepository().updateUnverifiedUser(id, d);
export const clearUnverifiedUserSecrets = (id) => getRepository().clearUnverifiedUserSecrets(id);
export const setGoogleVerifiedUser = (id, sub) => getRepository().setGoogleVerifiedUser(id, sub);
export const updateUserPasswordVerified = (id, h) => getRepository().updateUserPasswordVerified(id, h);
export const markUserEmailVerified = (id) => getRepository().markUserEmailVerified(id);
export const createSession = (s) => getRepository().createSession(s);
export const getSessionWithUser = (h) => getRepository().getSessionWithUser(h);
export const deleteSession = (h) => getRepository().deleteSession(h);
export const deleteUserSessions = (id) => getRepository().deleteUserSessions(id);
export const countRecentVerifications = (e, p, s) => getRepository().countRecentVerifications(e, p, s);
export const createVerification = (v) => getRepository().createVerification(v);
export const getLatestActiveVerification = (e, p) => getRepository().getLatestActiveVerification(e, p);
export const incrementVerificationAttempts = (id) => getRepository().incrementVerificationAttempts(id);
export const consumeVerification = (id, at) => getRepository().consumeVerification(id, at);
export const deleteUnusedUserVerifications = (id) => getRepository().deleteUnusedUserVerifications(id);
export const purgeExpiredAuthRecords = (at) => getRepository().purgeExpiredAuthRecords(at);
