import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createRequestId, submitAccessRequest } from '../api/forms.js';
import { ConsentField } from '../components/forms/ConsentField.jsx';
import { FormShell, mapServerError } from '../components/forms/FormShell.jsx';
import { HoneypotField } from '../components/forms/HoneypotField.jsx';
import { SelectField } from '../components/forms/SelectField.jsx';
import { TextField } from '../components/forms/TextField.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { brand } from '../content/brand.js';
import { getStartedCopy, sharedFormErrors } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { FORM_LIMITS, PHONE_PATTERN } from '../lib/formLimits.js';

const schema = z.object({
  company: z
    .string()
    .trim()
    .min(1, sharedFormErrors.required)
    .max(FORM_LIMITS.companyMax, sharedFormErrors.required),
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
  role: z.enum(['media_agency', 'direct_advertiser', 'publisher', 'ad_tech'], {
    message: sharedFormErrors.required,
  }),
  monthly_volume: z.enum(['under_10m', '10m_to_100m', 'over_100m'], {
    message: sharedFormErrors.required,
  }),
  consent_given: z.boolean().refine((v) => v === true, sharedFormErrors.consent),
  website: z.string().optional(),
});

export function GetStartedPage() {
  const title = pageTitles[ROUTES.getStarted] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: getStartedCopy.lede,
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
      company: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'media_agency',
      monthly_volume: 'under_10m',
      consent_given: false,
      website: '',
    },
  });

  const onSubmit = async (values) => {
    setSubmitError('');
    try {
      await submitAccessRequest(
        { ...values, request_id: requestIdRef.current },
        ROUTES.getStarted,
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
        <div className="page-eyebrow">{getStartedCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={getStartedCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{getStartedCopy.lede}</p>
      </header>

      <div className="form-single-wrap">
        <FormShell
          submitted={submitted}
          successTitle={getStartedCopy.successTitle}
          successBody={getStartedCopy.successBody}
          onReset={handleReset}
          submitError={submitError}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          submitLabel={getStartedCopy.submit}
        >
          <HoneypotField register={register('website')} />
          <div className="form-row-2">
            <TextField
              id="start-company"
              label={getStartedCopy.fields.company.label}
              placeholder={getStartedCopy.fields.company.placeholder}
              autoComplete="organization"
              maxLength={FORM_LIMITS.companyMax}
              error={errors.company?.message}
              register={register('company')}
            />
            <TextField
              id="start-name"
              label={getStartedCopy.fields.fullName.label}
              placeholder={getStartedCopy.fields.fullName.placeholder}
              autoComplete="name"
              maxLength={FORM_LIMITS.fullNameMax}
              error={errors.full_name?.message}
              register={register('full_name')}
            />
          </div>
          <div className="form-row-2">
            <TextField
              id="start-email"
              type="email"
              label={getStartedCopy.fields.email.label}
              placeholder={getStartedCopy.fields.email.placeholder}
              autoComplete="email"
              maxLength={FORM_LIMITS.emailMax}
              error={errors.email?.message}
              register={register('email')}
            />
            <TextField
              id="start-phone"
              type="tel"
              label={getStartedCopy.fields.phone.label}
              placeholder={getStartedCopy.fields.phone.placeholder}
              autoComplete="tel"
              maxLength={FORM_LIMITS.phoneMax}
              error={errors.phone?.message}
              register={register('phone')}
            />
          </div>
          <div className="form-row-2">
            <SelectField
              id="start-role"
              name="role"
              control={control}
              label={getStartedCopy.fields.role.label}
              placeholder={getStartedCopy.fields.role.placeholder}
              options={getStartedCopy.fields.role.options}
              error={errors.role?.message}
            />
            <SelectField
              id="start-volume"
              name="monthly_volume"
              control={control}
              label={getStartedCopy.fields.monthlyVolume.label}
              placeholder={getStartedCopy.fields.monthlyVolume.placeholder}
              options={getStartedCopy.fields.monthlyVolume.options}
              error={errors.monthly_volume?.message}
            />
          </div>
          <ConsentField
            id="start-consent"
            name="consent_given"
            control={control}
            label={getStartedCopy.fields.consent}
            error={errors.consent_given?.message}
          />
        </FormShell>
      </div>
    </PageShell>
  );
}
