import 'dotenv/config';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getAuthConfig,
  getSessionUser,
  handleForgotPassword,
  handleGoogleLogin,
  handleLogin,
  handleLogout,
  handleRegister,
  handleResetPassword,
  handleVerifyEmail,
  validateSessionConfig,
} from './functions/auth.js';
import { initStore, purgeExpiredAuthRecords } from './functions/db.js';
import { getPartners, getServiceStatus, getStories } from './functions/publicContent.js';
import { checkRateLimit } from './functions/rateLimit.js';
import { apiSecurityMiddleware, securityHeadersMiddleware } from './functions/security.js';
import { handleSubmitForm } from './functions/submitForm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

function enforceRateLimit(key: string, max: number, windowMs: number, res: Response) {
  const verdict = checkRateLimit(key, max, windowMs);
  if (!verdict.allowed) {
    res.setHeader('Retry-After', String(verdict.retryAfterSec));
    res.status(429).json({ ok: false, code: 'rate_limited' });
    return false;
  }
  return true;
}

async function startServer() {
  try {
    validateSessionConfig();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid session configuration.';
    process.stderr.write(`[startup] ${msg}\n`);
    process.exit(1);
  }

  if (IS_PROD && !process.env.DATABASE_URL) {
    process.stderr.write('[startup] WARNING: DATABASE_URL is not set; using local SQLite on ephemeral disk.\n');
  }

  await initStore();
  await purgeExpiredAuthRecords(new Date().toISOString()).catch(() => {});
  setInterval(() => {
    purgeExpiredAuthRecords(new Date().toISOString()).catch(() => {});
  }, 60 * 60 * 1000).unref();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(securityHeadersMiddleware(IS_PROD));

  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use('/api', apiSecurityMiddleware);

  app.use(
    '/api',
    express.json({
      limit: '10kb',
      verify: (req, _res, buf) => {
        Object.assign(req, { rawByteLength: buf.length });
      },
    }),
  );

  app.use((err: { type?: string } | null, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      if (err && err.type === 'entity.too.large') {
        return res.status(413).json({ ok: false, code: 'invalid_input' });
      }
      if (err) {
        return res.status(400).json({ ok: false, code: 'invalid_input' });
      }
      return res.status(500).json({ ok: false, code: 'server_error' });
    }
    return next(err);
  });

  app.post('/api/fn/submitForm', async (req, res) => {
    if (!enforceRateLimit(`form:ip:${req.ip}`, 10, 60 * 60 * 1000, res)) return;
    const rawLen = Number(Object.getOwnPropertyDescriptor(req, 'rawByteLength')?.value || 0);
    const result = await handleSubmitForm(req.body, rawLen);
    res.status(result.status).json(result.body);
  });

  app.get('/api/fn/getPartners', async (_req, res) => {
    try {
      res.status(200).json(await getPartners());
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.get('/api/fn/getStories', async (_req, res) => {
    try {
      res.status(200).json(await getStories());
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.get('/api/fn/getServiceStatus', async (_req, res) => {
    try {
      res.status(200).json(await getServiceStatus());
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    try {
      const user = await getSessionUser(req);
      res.status(200).json({ user, ...getAuthConfig() });
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    if (!enforceRateLimit(`login:ip:${req.ip}`, 10, 10 * 60 * 1000, res)) return;
    const rawEmail = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (rawEmail && !enforceRateLimit(`login:email:${rawEmail}`, 10, 10 * 60 * 1000, res)) return;
    const result = await handleLogin(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/register', async (req, res) => {
    if (!enforceRateLimit(`register:ip:${req.ip}`, 5, 60 * 60 * 1000, res)) return;
    const result = await handleRegister(req.body);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/verify-email', async (req, res) => {
    if (!enforceRateLimit(`verify:ip:${req.ip}`, 10, 10 * 60 * 1000, res)) return;
    const result = await handleVerifyEmail(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    if (!enforceRateLimit(`forgot:ip:${req.ip}`, 5, 60 * 60 * 1000, res)) return;
    const result = await handleForgotPassword(req.body);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    if (!enforceRateLimit(`reset:ip:${req.ip}`, 10, 10 * 60 * 1000, res)) return;
    const result = await handleResetPassword(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/google', async (req, res) => {
    if (!enforceRateLimit(`google:ip:${req.ip}`, 20, 10 * 60 * 1000, res)) return;
    const result = await handleGoogleLogin(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/logout', async (req, res) => {
    const result = await handleLogout(req, res);
    res.status(result.status).json(result.body);
  });

  app.use('/api', (_req, res) => {
    res.status(404).json({ ok: false, code: 'not_found' });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    process.stdout.write(`Crystal Koi server listening on http://0.0.0.0:${PORT}\n`);
  });
}

startServer();
