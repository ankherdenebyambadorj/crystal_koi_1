import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginCopy, sharedFormErrors } from '../../content/formsContent.js';
import { FORM_LIMITS } from '../../lib/formLimits.js';
import { TextField } from '../forms/TextField.jsx';
import { Alert } from '../ui/alert.jsx';
import { Button } from '../ui/button.jsx';

const verifySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, sharedFormErrors.codeFormat),
});

export function VerifyCodeForm({ authError, isPending, onSubmit, onBack }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  return (
    <form className="ck-glass form-card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="auth-sub-title">{loginCopy.verifyTitle}</h2>
      <p className="ck-lede">{loginCopy.verifyHint}</p>
      {authError && <Alert variant="error">{authError}</Alert>}
      <div className="form-fields">
        <TextField
          id="verify-code"
          label={loginCopy.fields.code.label}
          placeholder={loginCopy.fields.code.placeholder}
          maxLength={FORM_LIMITS.codeLength}
          error={errors.code?.message}
          register={register('code')}
        />
      </div>
      <div className="auth-actions">
        <Button type="submit" variant="fill" disabled={isPending}>
          {loginCopy.verifySubmit}
        </Button>
        <button type="button" className="auth-inline-link" onClick={onBack}>
          {loginCopy.backToLogin}
        </button>
      </div>
    </form>
  );
}
