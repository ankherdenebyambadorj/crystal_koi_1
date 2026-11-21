import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginCopy, sharedFormErrors } from '../../content/formsContent.js';
import { FORM_LIMITS } from '../../lib/formLimits.js';
import { TextField } from '../forms/TextField.jsx';
import { Alert } from '../ui/alert.jsx';
import { Button } from '../ui/button.jsx';

const forgotSchema = z.object({
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax),
});

const resetSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, sharedFormErrors.codeFormat),
  new_password: z.string().min(FORM_LIMITS.passwordMin, sharedFormErrors.passwordMin).max(FORM_LIMITS.passwordMax),
});

export function ForgotPasswordForm({ authError, isPending, onSubmit, onBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  return (
    <form className="ck-glass form-card" onSubmit={handleSubmit(onSubmit)} noValidate>
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
          error={errors.email?.message}
          register={register('email')}
        />
      </div>
      <div className="auth-actions">
        <Button type="submit" variant="fill" disabled={isPending}>
          {loginCopy.forgotSubmit}
        </Button>
        <button type="button" className="auth-inline-link" onClick={onBack}>
          {loginCopy.backToLogin}
        </button>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ authError, authNotice, isPending, onSubmit, onBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: '', new_password: '' },
  });

  return (
    <form className="ck-glass form-card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="auth-sub-title">{loginCopy.forgotTitle}</h2>
      {authNotice && <Alert variant="success">{authNotice}</Alert>}
      {authError && <Alert variant="error">{authError}</Alert>}
      <div className="form-fields">
        <TextField
          id="reset-code"
          label={loginCopy.fields.code.label}
          placeholder={loginCopy.fields.code.placeholder}
          maxLength={FORM_LIMITS.codeLength}
          error={errors.code?.message}
          register={register('code')}
        />
        <TextField
          id="reset-password"
          type="password"
          label={loginCopy.fields.newPassword.label}
          placeholder={loginCopy.fields.newPassword.placeholder}
          autoComplete="new-password"
          maxLength={FORM_LIMITS.passwordMax}
          error={errors.new_password?.message}
          register={register('new_password')}
        />
      </div>
      <div className="auth-actions">
        <Button type="submit" variant="fill" disabled={isPending}>
          {loginCopy.resetSubmit}
        </Button>
        <button type="button" className="auth-inline-link" onClick={onBack}>
          {loginCopy.backToLogin}
        </button>
      </div>
    </form>
  );
}
