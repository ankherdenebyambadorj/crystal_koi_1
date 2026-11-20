import { formMeta } from '../../content/formsContent.js';

export function HoneypotField({ register }) {
  return (
    <div className="form-honeypot" aria-hidden="true">
      <label htmlFor="ck-hp-website">{formMeta.honeypotLabel}</label>
      <input
        id="ck-hp-website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register}
      />
    </div>
  );
}
