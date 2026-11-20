import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { createRequestId, submitContactMessage } from '../api/forms.js';
import { ConsentField } from '../components/forms/ConsentField.jsx';
import { ContactInfoCard } from '../components/forms/ContactInfoCard.jsx';
import { FormShell, mapServerError } from '../components/forms/FormShell.jsx';
import { HoneypotField } from '../components/forms/HoneypotField.jsx';
import { SelectField } from '../components/forms/SelectField.jsx';
import { TextAreaField } from '../components/forms/TextAreaField.jsx';
import { TextField } from '../components/forms/TextField.jsx';
import { PageShell } from '../components/layout/PageShell.jsx';
import { RichText } from '../components/ui/RichText.jsx';
import { brand } from '../content/brand.js';
import { contactCopy, sharedFormErrors } from '../content/formsContent.js';
import { ROUTES } from '../content/routes.js';
import { pageTitles } from '../content/siteContent.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useReveal } from '../hooks/useReveal.js';
import { FORM_LIMITS, PHONE_PATTERN } from '../lib/formLimits.js';

const VALID_TOPICS = new Set(['general', 'partnership', 'support']);

function resolveInitialTopic(param) {
  return param && VALID_TOPICS.has(param) ? param : 'general';
}

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
    .optional()
    .default('')
    .refine((val) => val === '' || PHONE_PATTERN.test(val), sharedFormErrors.phone),
  company: z
    .string()
    .trim()
    .max(FORM_LIMITS.companyMax, sharedFormErrors.required)
    .optional()
    .default(''),
  topic: z.enum(['general', 'partnership', 'support'], {
    message: sharedFormErrors.required,
  }),
  message: z
    .string()
    .trim()
    .min(1, sharedFormErrors.required)
    .max(FORM_LIMITS.messageMax, sharedFormErrors.required),
  consent_given: z.boolean().refine((v) => v === true, sharedFormErrors.consent),
  website: z.string().optional(),
});

export function ContactPage() {
  const title = pageTitles[ROUTES.contact] || brand.name;
  usePageMeta({
    title: `${title} — ${brand.name}`,
    description: contactCopy.lede,
  });

  const [searchParams] = useSearchParams();
  const initialTopic = resolveInitialTopic(searchParams.get('topic'));
  const [headerRef, headerIn] = useReveal();
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const requestIdRef = useRef(createRequestId());

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      topic: initialTopic,
      message: '',
      consent_given: false,
      website: '',
    },
  });

  useEffect(() => {
    setValue('topic', initialTopic);
  }, [initialTopic, setValue]);

  const onSubmit = async (values) => {
    setSubmitError('');
    try {
      await submitContactMessage(
        { ...values, request_id: requestIdRef.current },
        ROUTES.contact,
      );
      setSubmitted(true);
    } catch (err) {
      setSubmitError(mapServerError(err));
    }
  };

  const handleReset = () => {
    requestIdRef.current = createRequestId();
    reset({
      full_name: '',
      email: '',
      phone: '',
      company: '',
      topic: initialTopic,
      message: '',
      consent_given: false,
      website: '',
    });
    setSubmitted(false);
    setSubmitError('');
  };

  return (
    <PageShell showCta={false}>
      <header ref={headerRef} className={`page-header reveal ${headerIn ? 'in' : ''}`}>
        <div className="page-eyebrow">{contactCopy.eyebrow}</div>
        <h1 className="page-title">
          <RichText parts={contactCopy.title} />
        </h1>
        <p className="ck-lede page-lede">{contactCopy.lede}</p>
      </header>

      <div className="contact-layout">
        <FormShell
          submitted={submitted}
          successTitle={contactCopy.successTitle}
          successBody={contactCopy.successBody}
          onReset={handleReset}
          submitError={submitError}
          onSubmit={handleSubmit(onSubmit)}
          isSubmitting={isSubmitting}
          submitLabel={contactCopy.submit}
        >
          <HoneypotField register={register('website')} />
          <div className="form-row-2">
            <TextField
              id="contact-name"
              label={contactCopy.fields.fullName.label}
              placeholder={contactCopy.fields.fullName.placeholder}
              autoComplete="name"
              maxLength={FORM_LIMITS.fullNameMax}
              error={errors.full_name?.message}
              register={register('full_name')}
            />
            <TextField
              id="contact-email"
              type="email"
              label={contactCopy.fields.email.label}
              placeholder={contactCopy.fields.email.placeholder}
              autoComplete="email"
              maxLength={FORM_LIMITS.emailMax}
              error={errors.email?.message}
              register={register('email')}
            />
          </div>
          <div className="form-row-2">
            <TextField
              id="contact-phone"
              type="tel"
              label={contactCopy.fields.phone.label}
              placeholder={contactCopy.fields.phone.placeholder}
              autoComplete="tel"
              maxLength={FORM_LIMITS.phoneMax}
              error={errors.phone?.message}
              register={register('phone')}
            />
            <TextField
              id="contact-company"
              label={contactCopy.fields.company.label}
              placeholder={contactCopy.fields.company.placeholder}
              autoComplete="organization"
              maxLength={FORM_LIMITS.companyMax}
              error={errors.company?.message}
              register={register('company')}
            />
          </div>
          <SelectField
            id="contact-topic"
            name="topic"
            control={control}
            label={contactCopy.fields.topic.label}
            placeholder={contactCopy.fields.topic.placeholder}
            options={contactCopy.fields.topic.options}
            error={errors.topic?.message}
          />
          <TextAreaField
            id="contact-message"
            label={contactCopy.fields.message.label}
            placeholder={contactCopy.fields.message.placeholder}
            maxLength={FORM_LIMITS.messageMax}
            error={errors.message?.message}
            register={register('message')}
          />
          <ConsentField
            id="contact-consent"
            name="consent_given"
            control={control}
            label={contactCopy.fields.consent}
            error={errors.consent_given?.message}
          />
        </FormShell>

        <ContactInfoCard />
      </div>
    </PageShell>
  );
}
