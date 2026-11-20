import { Link } from 'react-router-dom';
import { formMeta, sharedFormErrors } from '../../content/formsContent.js';
import { ROUTES } from '../../content/routes.js';
import { Alert } from '../ui/alert.jsx';
import { Button } from '../ui/button.jsx';

export function mapServerError(error) {
  const code = error?.code || '';
  if (code === 'rate_limited') return sharedFormErrors.rateLimited;
  if (code === 'invalid_credentials') return sharedFormErrors.invalidCredentials;
  if (code === 'invalid_code') return sharedFormErrors.invalidCode;
  if (code === 'verification_required') return sharedFormErrors.verificationRequired;
  if (code === 'invalid_input') return sharedFormErrors.required;
  return sharedFormErrors.unavailable;
}

export function FormShell({
  submitted,
  successTitle,
  successBody,
  onReset,
  submitError,
  onSubmit,
  isSubmitting,
  submitLabel,
  children,
}) {
  if (submitted) {
    return (
      <div className="ck-glass form-card form-success" role="status" aria-live="polite">
        <div className="form-success-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="form-success-title">{successTitle}</h2>
        <p className="ck-lede form-success-body">{successBody}</p>
        <div className="form-success-actions">
          <Button asChild variant="fill">
            <Link to={ROUTES.home}>{formMeta.backHome}</Link>
          </Button>
          {onReset && (
            <Button variant="ghost" onClick={onReset}>
              {formMeta.openNextStep}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className="ck-glass form-card" onSubmit={onSubmit} noValidate>
      {submitError && (
        <Alert variant="error" className="form-alert">
          {submitError}
        </Alert>
      )}
      <div className="form-fields">{children}</div>
      <div className="form-submit-row">
        <Button type="submit" variant="fill" disabled={isSubmitting}>
          {isSubmitting ? formMeta.submitting : submitLabel}
        </Button>
      </div>
    </form>
  );
}
