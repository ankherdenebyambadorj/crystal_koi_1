import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginCopy, sharedFormErrors } from '../../content/formsContent.js';
import { FORM_LIMITS } from '../../lib/formLimits.js';
import { TextField } from '../forms/TextField.jsx';
import { Button } from '../ui/button.jsx';

const loginSchema = z.object({
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax),
  password: z.string().min(FORM_LIMITS.passwordMin, sharedFormErrors.passwordMin).max(FORM_LIMITS.passwordMax),
});

export function LoginForm({ isPending, onSubmit, onForgot }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-fields">
        <TextField
          id="login-email"
          type="email"
          label={loginCopy.fields.email.label}
          placeholder={loginCopy.fields.email.placeholder}
          autoComplete="email"
          maxLength={FORM_LIMITS.emailMax}
          error={errors.email?.message}
          register={register('email')}
        />
        <TextField
          id="login-password"
          type="password"
          label={loginCopy.fields.password.label}
          placeholder={loginCopy.fields.password.placeholder}
          autoComplete="current-password"
          maxLength={FORM_LIMITS.passwordMax}
          error={errors.password?.message}
          register={register('password')}
        />
      </div>
      <div className="auth-actions">
        <Button type="submit" variant="fill" disabled={isPending}>
          {loginCopy.loginSubmit}
        </Button>
        <button type="button" className="auth-inline-link" onClick={onForgot}>
          {loginCopy.forgotLink}
        </button>
      </div>
    </form>
  );
}
