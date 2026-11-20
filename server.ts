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
} from './functions/auth.js';
import { getDb } from './functions/db.js';
import { getPartners, getServiceStatus, getStories } from './functions/publicContent.js';
import { handleSubmitForm } from './functions/submitForm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

async function startServer() {
  getDb();

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
  });

  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

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
      const status = err && err.type === 'entity.too.large' ? 413 : 400;
      return res.status(status).json({ ok: false, code: 'invalid_input' });
    }
    return next(err);
  });

  app.post('/api/fn/submitForm', async (req, res) => {
    const rawLen = Number(Object.getOwnPropertyDescriptor(req, 'rawByteLength')?.value || 0);
    const result = await handleSubmitForm(req.body, rawLen);
    res.status(result.status).json(result.body);
  });

  app.get('/api/fn/getPartners', (_req, res) => {
    try {
      res.status(200).json(getPartners());
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.get('/api/fn/getStories', (_req, res) => {
    try {
      res.status(200).json(getStories());
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.get('/api/fn/getServiceStatus', (_req, res) => {
    try {
      res.status(200).json(getServiceStatus());
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    try {
      const user = getSessionUser(req);
      res.status(200).json({ user, ...getAuthConfig() });
    } catch {
      res.status(503).json({ ok: false, code: 'unavailable' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const result = await handleLogin(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/register', async (req, res) => {
    const result = await handleRegister(req.body);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/verify-email', async (req, res) => {
    const result = await handleVerifyEmail(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    const result = await handleForgotPassword(req.body);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    const result = await handleResetPassword(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/google', async (req, res) => {
    const result = await handleGoogleLogin(req.body, res);
    res.status(result.status).json(result.body);
  });

  app.post('/api/auth/logout', (req, res) => {
    const result = handleLogout(req, res);
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
