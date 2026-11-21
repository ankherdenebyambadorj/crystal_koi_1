import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginCopy, sharedFormErrors } from '../../content/formsContent.js';
import { FORM_LIMITS } from '../../lib/formLimits.js';
import { TextField } from '../forms/TextField.jsx';
import { Button } from '../ui/button.jsx';

const registerSchema = z.object({
  full_name: z.string().trim().min(1, sharedFormErrors.required).max(FORM_LIMITS.fullNameMax),
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax),
  password: z.string().min(FORM_LIMITS.passwordMin, sharedFormErrors.passwordMin).max(FORM_LIMITS.passwordMax),
});

export function SignupForm({ isPending, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: '', email: '', password: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-fields">
        <TextField
          id="reg-name"
          label={loginCopy.fields.fullName.label}
          placeholder={loginCopy.fields.fullName.placeholder}
          autoComplete="name"
          maxLength={FORM_LIMITS.fullNameMax}
          error={errors.full_name?.message}
          register={register('full_name')}
        />
        <TextField
          id="reg-email"
          type="email"
          label={loginCopy.fields.email.label}
          placeholder={loginCopy.fields.email.placeholder}
          autoComplete="email"
          maxLength={FORM_LIMITS.emailMax}
          error={errors.email?.message}
          register={register('email')}
        />
        <TextField
          id="reg-password"
          type="password"
          label={loginCopy.fields.password.label}
          placeholder={loginCopy.fields.password.placeholder}
          autoComplete="new-password"
          maxLength={FORM_LIMITS.passwordMax}
          error={errors.password?.message}
          register={register('password')}
        />
      </div>
      <div className="auth-actions">
        <Button type="submit" variant="fill" disabled={isPending}>
          {loginCopy.registerSubmit}
        </Button>
      </div>
    </form>
  );
}
