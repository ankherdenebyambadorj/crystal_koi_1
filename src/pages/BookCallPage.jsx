import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createRequestId, submitCallRequest } from '../api/forms.js';
import { ConsentField } from '../components/forms/ConsentField.jsx';
import { FormShell, mapServerError } from '../components/forms/FormShell.jsx';
import { HoneypotField } from '../components/forms/HoneypotField.jsx';
import { SelectField } from '../components/forms/SelectField.jsx';
import { TextField } from '../components/forms/TextField.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { brand } from '../content/brand.js';
import { bookCallCopy, sharedFormErrors } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { FORM_LIMITS, PHONE_PATTERN } from '../lib/formLimits.js';

const schema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, sharedFormErrors.required)
    .max(FORM_LIMITS.fullNameMax, sharedFormErrors.required),
  email: z
    .string()
    .trim()
    .email(sharedFormErrors.email)
    .max(FORM_LIMITS.emailMax, sharedFormErrors.email),
  phone: z
    .string()
    .trim()
    .regex(PHONE_PATTERN, sharedFormErrors.phone),
  company: z
    .string()
    .trim()
    .min(1, sharedFormErrors.required)
    .max(FORM_LIMITS.companyMax, sharedFormErrors.required),
  preferred_window: z.enum(['morning', 'afternoon', 'evening'], {
    message: sharedFormErrors.required,
  }),
  consent_given: z.boolean().refine((v) => v === true, sharedFormErrors.consent),
  website: z.string().optional(),
});

export function BookCallPage() {
  const title = pageTitles[ROUTES.bookACall] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: bookCallCopy.lede,
  });

  const [headerRef, headerIn] = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const requestIdRef = useRef(createRequestId());

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      preferred_window: 'morning',
      consent_given: false,
      website: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');
    try {
      await submitCallRequest(
        { ...values, request_id: requestIdRef.current },
        ROUTES.bookACall,
      );
      setSubmitted(true);
    } catch (err) {
      setSubmitError(mapServerError(err));
    }
  };

  const handleReset = () => {
    requestIdRef.current = createRequestId();
    reset();
    setSubmitted(false);
    setSubmitError('');
  };

  return (
    <PageShell showCta={false}>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{bookCallCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={bookCallCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{bookCallCopy.lede}</p>
      </header>

      <div className="form-single-wrap">
        <FormShell
          submitted={submitted}
          successTitle={bookCallCopy.successTitle}
          successBody={bookCallCopy.successBody}
          onReset={handleReset}
          submitError={submitError}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          submitLabel={bookCallCopy.submit}
        >
          <HoneypotField register={register('website')} />
          <div className="form-row-2">
            <TextField
              id="call-name"
              label={bookCallCopy.fields.fullName.label}
              placeholder={bookCallCopy.fields.fullName.placeholder}
              autoComplete="name"
              maxLength={FORM_LIMITS.fullNameMax}
              error={errors.full_name?.message}
              register={register('full_name')}
            />
            <TextField
              id="call-email"
              type="email"
              label={bookCallCopy.fields.email.label}
              placeholder={bookCallCopy.fields.email.placeholder}
              autoComplete="email"
              maxLength={FORM_LIMITS.emailMax}
              error={errors.email?.message}
              register={register('email')}
            />
          </div>
          <div className="form-row-2">
            <TextField
              id="call-phone"
              type="tel"
              label={bookCallCopy.fields.phone.label}
              placeholder={bookCallCopy.fields.phone.placeholder}
              autoComplete="tel"
              maxLength={FORM_LIMITS.phoneMax}
              error={errors.phone?.message}
              register={register('phone')}
            />
            <TextField
              id="call-company"
              label={bookCallCopy.fields.company.label}
              placeholder={bookCallCopy.fields.company.placeholder}
              autoComplete="organization"
              maxLength={FORM_LIMITS.companyMax}
              error={errors.company?.message}
              register={register('company')}
            />
          </div>
          <SelectField
            id="call-window"
            name="preferred_window"
            control={control}
            label={bookCallCopy.fields.preferredWindow.label}
            placeholder={bookCallCopy.fields.preferredWindow.placeholder}
            options={bookCallCopy.fields.preferredWindow.options}
            error={errors.preferred_window?.message}
          />
          <ConsentField
            id="call-consent"
            name="consent_given"
            control={control}
            label={bookCallCopy.fields.consent}
            error={errors.consent_given?.message}
          />
        </FormShell>
      </div>
    </PageShell>
  );
}
