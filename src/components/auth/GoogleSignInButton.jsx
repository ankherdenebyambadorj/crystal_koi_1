import { useEffect, useRef } from 'react';
import { GOOGLE_GSI_SCRIPT_URL } from '../../content/assets.js';
import { loginCopy } from '../../content/formsContent.js';
import { mapServerError } from '../forms/FormShell.jsx';

export function GoogleSignInButton({ googleClientId, onToken, onError }) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!googleClientId) return undefined;

    const renderGoogle = () => {
      if (!window.google?.accounts?.id || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) return;
          try {
            await onToken(response.credential);
          } catch (err) {
            onError(mapServerError(err));
          }
        },
      });
      btnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogle();
      return undefined;
    }

    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', renderGoogle);
      return () => existing.removeEventListener('load', renderGoogle);
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = GOOGLE_GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', renderGoogle);
    document.head.appendChild(script);
    return () => script.removeEventListener('load', renderGoogle);
  }, [googleClientId, onToken, onError]);

  if (!googleClientId) return null;

  return (
    <div className="auth-google-wrap">
      <div ref={btnRef} aria-label={loginCopy.googleButton} />
    </div>
  );
}
