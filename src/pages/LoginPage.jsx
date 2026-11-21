import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ForgotPasswordForm, ResetPasswordForm } from '../components/auth/ForgotResetForms.jsx';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton.jsx';
import { LoginForm } from '../components/auth/LoginForm.jsx';
import { SignupForm } from '../components/auth/SignupForm.jsx';
import { VerifyCodeForm } from '../components/auth/VerifyCodeForm.jsx';
import { mapServerError } from '../components/forms/FormShell.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import { Alert } from '../components/ui/alert.jsx';
import { Button } from '../components/ui/button.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs.jsx';
import { brand } from '../content/brand.js';
import { loginCopy } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { useAuth } from '../hooks/useAuth.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { sanitizeInternalNextPath } from '../lib/formLimits.js';

export function LoginPage() {
  const title = pageTitles[ROUTES.login] || brand.name;
  usePageMeta({ title: `${title} — ${brand.name}`, description: loginCopy.lede });

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
  const [viewMode, setViewMode] = useState('tabs');
  const [pendingEmail, setPendingEmail] = useState('');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  const backToTabs = useCallback(() => {
    setAuthError('');
    setAuthNotice('');
    setViewMode('tabs');
  }, []);

  const handleGoogleToken = useCallback(
    async (credential) => {
      setAuthError('');
      await googleLogin.mutateAsync(credential);
      navigate(nextPath);
    },
    [googleLogin, navigate, nextPath],
  );

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
          <VerifyCodeForm authError={authError} isPending={verifyEmail.isPending} onSubmit={onVerify} onBack={backToTabs} />
        ) : viewMode === 'forgot' ? (
          <ForgotPasswordForm authError={authError} isPending={forgotPassword.isPending} onSubmit={onForgot} onBack={backToTabs} />
        ) : viewMode === 'reset' ? (
          <ResetPasswordForm authError={authError} authNotice={authNotice} isPending={resetPassword.isPending} onSubmit={onResetPassword} onBack={backToTabs} />
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

              {authError && <Alert variant="error" className="form-alert">{authError}</Alert>}

              <TabsContent value="login">
                <LoginForm
                  isPending={login.isPending}
                  onSubmit={onLogin}
                  onForgot={() => {
                    setAuthError('');
                    setViewMode('forgot');
                  }}
                />
              </TabsContent>

              <TabsContent value="register">
                <SignupForm isPending={registerMut.isPending} onSubmit={onRegister} />
              </TabsContent>
            </Tabs>

            <GoogleSignInButton
              googleClientId={googleClientId}
              onToken={handleGoogleToken}
              onError={setAuthError}
            />
          </div>
        )}
      </div>
    </PageShell>
  );
}
