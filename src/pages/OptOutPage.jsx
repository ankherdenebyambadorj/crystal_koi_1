import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createRequestId, submitOptOutRequest } from '../api/forms.js';
import { FormShell, mapServerError } from '../components/forms/FormShell.jsx';
import { HoneypotField } from '../components/forms/HoneypotField.jsx';
import { TextAreaField } from '../components/forms/TextAreaField.jsx';
import { TextField } from '../components/forms/TextField.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { brand } from '../content/brand.js';
import { optOutCopy, sharedFormErrors } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { FORM_LIMITS } from '../lib/formLimits.js';

const schema = z.object({
  email: z.string().trim().email(sharedFormErrors.email).max(FORM_LIMITS.emailMax, sharedFormErrors.email),
  reason: z.string().trim().max(FORM_LIMITS.reasonMax, sharedFormErrors.required).optional().default(''),
  website: z.string().optional(),
});

export function OptOutPage() {
  const title = pageTitles[ROUTES.optOut] || brand.name;
  usePageMeta({ title: `${title} — ${brand.name}`, description: optOutCopy.lede });

  const [headerRef, headerIn] = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [pendingValues, setPendingValues] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const requestIdRef = useRef(createRequestId());

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '', reason: '', website: '' },
  });

  const handleConfirm = async () => {
    if (!pendingValues || confirming) return;
    setConfirming(true);
    setSubmitError('');
    try {
      await submitOptOutRequest({ ...pendingValues, request_id: requestIdRef.current }, ROUTES.optOut);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(mapServerError(err));
    } finally {
      setConfirming(false);
      setPendingValues(null);
    }
  };

  const handleReset = () => {
    requestIdRef.current = createRequestId();
    reset();
    setSubmitted(false);
    setSubmitError('');
    setPendingValues(null);
  };

  return (
    <PageShell showCta={false}>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{optOutCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={optOutCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{optOutCopy.lede}</p>
      </header>

      <div className="form-single-wrap">
        <FormShell
          submitted={submitted}
          successTitle={optOutCopy.successTitle}
          successBody={optOutCopy.successBody}
          onReset={handleReset}
          submitError={submitError}
          onSubmit={handleSubmit((values) => {
            setSubmitError('');
            setPendingValues(values);
          })}
          isSubmitting={isSubmitting || confirming}
          submitLabel={optOutCopy.submit}
        >
          <HoneypotField register={register('website')} />
          <TextField
            id="optout-email"
            type="email"
            label={optOutCopy.fields.email.label}
            placeholder={optOutCopy.fields.email.placeholder}
            autoComplete="email"
            maxLength={FORM_LIMITS.emailMax}
            error={errors.email?.message}
            register={register('email')}
          />
          <TextAreaField
            id="optout-reason"
            label={optOutCopy.fields.reason.label}
            placeholder={optOutCopy.fields.reason.placeholder}
            maxLength={FORM_LIMITS.reasonMax}
            rows={4}
            error={errors.reason?.message}
            register={register('reason')}
          />
        </FormShell>
      </div>

      <AlertDialog
        open={Boolean(pendingValues)}
        onOpenChange={(open) => {
          if (!open && !confirming) setPendingValues(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{optOutCopy.confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{optOutCopy.confirm.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirming}>{optOutCopy.confirm.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={confirming}>
              {optOutCopy.confirm.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
