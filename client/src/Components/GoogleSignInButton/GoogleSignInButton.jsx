import { useEffect, useRef } from 'react';
import { loginWithGoogle } from '../../api/auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

/**
 * Botón de "Continuar con Google" con Google Identity Services (no usa
 * Firebase). onSuccess recibe { token, user } igual que el login normal.
 */
const GoogleSignInButton = ({ onSuccess, onError }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const data = await loginWithGoogle(response.credential);
            onSuccess?.(data);
          } catch (err) {
            onError?.(err);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    };

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);

    if (window.google?.accounts?.id) {
      renderButton();
    } else if (existing) {
      existing.addEventListener('load', renderButton);
    } else {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.onload = renderButton;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [onSuccess, onError]);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={buttonRef} className='flex justify-center' />;
};

export default GoogleSignInButton;
