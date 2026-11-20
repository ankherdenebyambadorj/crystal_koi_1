import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { mapServerError } from '../components/forms/FormShell.jsx';
import { TextField } from '../components/forms/TextField.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Button } from '../components/ui/button.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { brand } from '../content/brand.js';
import { loginCopy, sharedFormErrors } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { useAuth } from '../hooks/useAuth.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { FORM_LIMITS, sanitizeInternalNextPath } from '../lib/formLimits.js';

const loginSchema = z.object({
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax),
  password: z
    .string()
    .min(FORM_LIMITS.passwordMin, sharedFormErrors.passwordMin)
    .max(FORM_LIMITS.passwordMax),
});

const registerSchema = z.object({
  full_name: z.string().trim().min(1, sharedFormErrors.required).max(FORM_LIMITS.fullNameMax),
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax),
  password: z
    .string()
    .min(FORM_LIMITS.passwordMin, sharedFormErrors.passwordMin)
    .max(FORM_LIMITS.passwordMax),
});

const verifySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, sharedFormErrors.codeFormat),
});

const forgotSchema = z.object({
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax),
});

const resetSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, sharedFormErrors.codeFormat),
  new_password: z
    .string()
    .min(FORM_LIMITS.passwordMin, sharedFormErrors.passwordMin)
    .max(FORM_LIMITS.passwordMax),
});

export function LoginPage() {
  const title = pageTitles[ROUTES.login] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: loginCopy.lede,
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = sanitizeInternalNextPath(searchParams.get('next'), ROUTES.home);
  const [headerRef, headerIn] = useReveal();

  const {
    user,
    googleClientId,
    login,
    register: registerMut,
    verifyEmail,
    forgotPassword,
    resetPassword,
    googleLogin,
    logout,
  } = useAuth();

  const [tab, setTab] = useState('login');
  const [viewMode, setViewMode] = useState('tabs'); // 'tabs' | 'verify' | 'forgot' | 'reset'
  const [pendingEmail, setPendingEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const googleBtnRef = useRef(null);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', password: '' },
  });

  const verifyForm = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const forgotForm = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: '', new_password: '' },
  });

  useEffect(() => {
    if (!googleClientId || user || viewMode !== 'tabs') return undefined;
    const renderGoogle = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response?.credential) return;
            setAuthError('');
            try {
              await googleLogin.mutateAsync(response.credential);
              navigate(nextPath);
            } catch (err) {
              setAuthError(mapServerError(err));
            }
          },
        });
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
        });
      }
    };

    if (window.google?.accounts?.id) {
      renderGoogle();
      return undefined;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', renderGoogle);
      return () => existingScript.removeEventListener('load', renderGoogle);
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderGoogle);
    document.head.appendChild(script);
    return () => script.removeEventListener('load', renderGoogle);
  }, [googleClientId, user, viewMode, googleLogin, navigate, nextPath]);

  const onLogin = async (values) => {
    setAuthError('');
    setAuthNotice('');
    try {
      await login.mutateAsync(values);
      navigate(nextPath);
    } catch (err) {
      setAuthError(mapServerError(err));
    }
  };

  const onRegister = async (values) => {
    setAuthError('');
    setAuthNotice('');
    try {
      await registerMut.mutateAsync(values);
      setPendingEmail(values.email.trim().toLowerCase());
      verifyForm.reset();
      setViewMode('verify');
    } catch (err) {
      setAuthError(mapServerError(err));
    }
  };

  const onVerify = async (values) => {
    setAuthError('');
    try {
      await verifyEmail.mutateAsync({ email: pendingEmail, code: values.code.trim() });
      navigate(nextPath);
    } catch (err) {
      setAuthError(mapServerError(err));
    }
  };

  const onForgot = async (values) => {
    setAuthError('');
    try {
      await forgotPassword.mutateAsync({ email: values.email });
      setPendingEmail(values.email.trim().toLowerCase());
      setAuthNotice(loginCopy.forgotSentNote);
      resetForm.reset();
      setViewMode('reset');
    } catch (err) {
      setAuthError(mapServerError(err));
    }
  };

  const onResetPassword = async (values) => {
    setAuthError('');
    try {
      await resetPassword.mutateAsync({
        email: pendingEmail,
        code: values.code.trim(),
        new_password: values.new_password,
      });
      navigate(nextPath);
    } catch (err) {
      setAuthError(mapServerError(err));
    }
  };

  return (
    <PageShell showCta={false}>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{loginCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={loginCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{loginCopy.lede}</p>
      </header>

      <div className="auth-wrap">
        {user ? (
          <div className="ck-glass form-card auth-signed-card">
            <h2 className="form-success-title">{loginCopy.alreadySignedInTitle}</h2>
            <p className="ck-lede">{user.full_name || user.email}</p>
            <div className="form-success-actions">
              <Button variant="fill" onClick={() => navigate(nextPath)}>
                {loginCopy.alreadySignedInAction}
              </Button>
              <Button variant="ghost" onClick={() => logout.mutate()}>
                {loginCopy.logoutLabel}
              </Button>
            </div>
          </div>
        ) : viewMode === 'verify' ? (
          <form
            className="ck-glass form-card"
            onSubmit={verifyForm.handleSubmit(onVerify)}
            noValidate
          >
            <h2 className="auth-sub-title">{loginCopy.verifyTitle}</h2>
            <p className="ck-lede">{loginCopy.verifyHint}</p>
            {authError && <Alert variant="error">{authError}</Alert>}
            <div className="form-fields">
              <TextField
                id="verify-code"
                label={loginCopy.fields.code.label}
                placeholder={loginCopy.fields.code.placeholder}
                maxLength={FORM_LIMITS.codeLength}
                error={verifyForm.formState.errors.code?.message}
                register={verifyForm.register('code')}
              />
            </div>
            <div className="auth-actions">
              <Button type="submit" variant="fill" disabled={verifyEmail.isPending}>
                {loginCopy.verifySubmit}
              </Button>
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => {
                  setAuthError('');
                  setViewMode('tabs');
                }}
              >
                {loginCopy.backToLogin}
              </button>
            </div>
          </form>
        ) : viewMode === 'forgot' ? (
          <form
            className="ck-glass form-card"
            onSubmit={forgotForm.handleSubmit(onForgot)}
            noValidate
          >
            <h2 className="auth-sub-title">{loginCopy.forgotTitle}</h2>
            <p className="ck-lede">{loginCopy.forgotHint}</p>
            {authError && <Alert variant="error">{authError}</Alert>}
            <div className="form-fields">
              <TextField
                id="forgot-email"
                type="email"
                label={loginCopy.fields.email.label}
                placeholder={loginCopy.fields.email.placeholder}
                autoComplete="email"
                maxLength={FORM_LIMITS.emailMax}
                error={forgotForm.formState.errors.email?.message}
                register={forgotForm.register('email')}
              />
            </div>
            <div className="auth-actions">
              <Button type="submit" variant="fill" disabled={forgotPassword.isPending}>
                {loginCopy.forgotSubmit}
              </Button>
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => {
                  setAuthError('');
                  setViewMode('tabs');
                }}
              >
                {loginCopy.backToLogin}
              </button>
            </div>
          </form>
        ) : viewMode === 'reset' ? (
          <form
            className="ck-glass form-card"
            onSubmit={resetForm.handleSubmit(onResetPassword)}
            noValidate
          >
            <h2 className="auth-sub-title">{loginCopy.forgotTitle}</h2>
            {authNotice && <Alert variant="success">{authNotice}</Alert>}
            {authError && <Alert variant="error">{authError}</Alert>}
            <div className="form-fields">
              <TextField
                id="reset-code"
                label={loginCopy.fields.code.label}
                placeholder={loginCopy.fields.code.placeholder}
                maxLength={FORM_LIMITS.codeLength}
                error={resetForm.formState.errors.code?.message}
                register={resetForm.register('code')}
              />
              <TextField
                id="reset-password"
                type="password"
                label={loginCopy.fields.newPassword.label}
                placeholder={loginCopy.fields.newPassword.placeholder}
                autoComplete="new-password"
                maxLength={FORM_LIMITS.passwordMax}
                error={resetForm.formState.errors.new_password?.message}
                register={resetForm.register('new_password')}
              />
            </div>
            <div className="auth-actions">
              <Button type="submit" variant="fill" disabled={resetPassword.isPending}>
                {loginCopy.resetSubmit}
              </Button>
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => {
                  setAuthError('');
                  setViewMode('tabs');
                }}
              >
                {loginCopy.backToLogin}
              </button>
            </div>
          </form>
        ) : (
          <div className="ck-glass form-card">
            <Tabs
              value={tab}
              onValueChange={(nextTab) => {
                setTab(nextTab);
                setAuthError('');
                setAuthNotice('');
              }}
            >
              <TabsList>
                <TabsTrigger value="login">{loginCopy.tabs.login}</TabsTrigger>
                <TabsTrigger value="register">{loginCopy.tabs.register}</TabsTrigger>
              </TabsList>

              {authError && (
                <Alert variant="error" className="form-alert">
                  {authError}
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate>
                  <div className="form-fields">
                    <TextField
                      id="login-email"
                      type="email"
                      label={loginCopy.fields.email.label}
                      placeholder={loginCopy.fields.email.placeholder}
                      autoComplete="email"
                      maxLength={FORM_LIMITS.emailMax}
                      error={loginForm.formState.errors.email?.message}
                      register={loginForm.register('email')}
                    />
                    <TextField
                      id="login-password"
                      type="password"
                      label={loginCopy.fields.password.label}
                      placeholder={loginCopy.fields.password.placeholder}
                      autoComplete="current-password"
                      maxLength={FORM_LIMITS.passwordMax}
                      error={loginForm.formState.errors.password?.message}
                      register={loginForm.register('password')}
                    />
                  </div>
                  <div className="auth-actions">
                    <Button type="submit" variant="fill" disabled={login.isPending}>
                      {loginCopy.loginSubmit}
                    </Button>
                    <button
                      type="button"
                      className="auth-inline-link"
                      onClick={() => {
                        setAuthError('');
                        setViewMode('forgot');
                      }}
                    >
                      {loginCopy.forgotLink}
                    </button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={registerForm.handleSubmit(onRegister)} noValidate>
                  <div className="form-fields">
                    <TextField
                      id="reg-name"
                      label={loginCopy.fields.fullName.label}
                      placeholder={loginCopy.fields.fullName.placeholder}
                      autoComplete="name"
                      maxLength={FORM_LIMITS.fullNameMax}
                      error={registerForm.formState.errors.full_name?.message}
                      register={registerForm.register('full_name')}
                    />
                    <TextField
                      id="reg-email"
                      type="email"
                      label={loginCopy.fields.email.label}
                      placeholder={loginCopy.fields.email.placeholder}
                      autoComplete="email"
                      maxLength={FORM_LIMITS.emailMax}
                      error={registerForm.formState.errors.email?.message}
                      register={registerForm.register('email')}
                    />
                    <TextField
                      id="reg-password"
                      type="password"
                      label={loginCopy.fields.password.label}
                      placeholder={loginCopy.fields.password.placeholder}
                      autoComplete="new-password"
                      maxLength={FORM_LIMITS.passwordMax}
                      error={registerForm.formState.errors.password?.message}
                      register={registerForm.register('password')}
                    />
                  </div>
                  <div className="auth-actions">
                    <Button type="submit" variant="fill" disabled={registerMut.isPending}>
                      {loginCopy.registerSubmit}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {googleClientId && (
              <div className="auth-google-wrap">
                <div ref={googleBtnRef} aria-label={loginCopy.googleButton} />
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
