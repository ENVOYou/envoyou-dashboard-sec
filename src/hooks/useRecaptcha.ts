import { useCallback, useEffect, useState } from 'react';

interface GreCaptcha {
  execute(siteKey: string, options: { action: string }): Promise<string>;
  ready(callback: () => void): void;
}

declare global {
  interface Window {
    grecaptcha: GreCaptcha;
  }
}

export const useRecaptcha = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
      console.warn('reCAPTCHA site key not configured');
      return;
    }

    // Check if already loaded
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const executeRecaptcha = useCallback(async (action: string = 'submit'): Promise<string | null> => {
    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!isLoaded || !RECAPTCHA_SITE_KEY || !window.grecaptcha) {
      console.warn('reCAPTCHA not loaded or not configured');
      return null;
    }

    setIsLoading(true);

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      return token;
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded]);

  return {
    executeRecaptcha,
    isLoaded,
    isLoading,
  };
};