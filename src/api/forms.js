import { invokeApi } from './invokeFunction.js';

export function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function submitIntakeForm(payload) {
  return invokeApi('/api/fn/submitForm', {
    method: 'POST',
    body: payload,
  });
}

export function submitCallRequest(values, sourcePath) {
  return submitIntakeForm({
    kind: 'call_request',
    request_id: values.request_id,
    website: values.website || '',
    source_path: sourcePath,
    full_name: values.full_name,
    email: values.email,
    phone: values.phone,
    company: values.company,
    preferred_window: values.preferred_window,
    consent_given: values.consent_given,
  });
}

export function submitAccessRequest(values, sourcePath) {
  return submitIntakeForm({
    kind: 'access_request',
    request_id: values.request_id,
    website: values.website || '',
    source_path: sourcePath,
    full_name: values.full_name,
    email: values.email,
    phone: values.phone,
    company: values.company,
    role: values.role,
    monthly_volume: values.monthly_volume,
    consent_given: values.consent_given,
  });
}

export function submitContactMessage(values, sourcePath) {
  return submitIntakeForm({
    kind: 'contact_message',
    request_id: values.request_id,
    website: values.website || '',
    source_path: sourcePath,
    full_name: values.full_name,
    email: values.email,
    phone: values.phone || '',
    company: values.company || '',
    topic: values.topic,
    message: values.message,
    consent_given: values.consent_given,
  });
}

export function submitOptOutRequest(values, sourcePath) {
  return submitIntakeForm({
    kind: 'opt_out',
    request_id: values.request_id,
    website: values.website || '',
    source_path: sourcePath,
    email: values.email,
    reason: values.reason || '',
  });
}
