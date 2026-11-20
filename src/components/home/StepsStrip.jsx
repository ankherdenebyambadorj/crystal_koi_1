import { useReveal } from '../../hooks/useReveal.js';

export function StepsStrip({ steps }) {
  const [ref, revealed] = useReveal();

  return (
    <ol ref={ref} className={`steps-strip reveal ${revealed ? 'in' : ''}`}>
      {steps.map((step, idx) => (
        <li key={step.lead} className="steps-item">
          <span className="steps-num">{String(idx + 1).padStart(2, '0')}</span>
          <div>
            <span className="steps-lead">{step.lead}</span>
            <span>{step.text}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}
