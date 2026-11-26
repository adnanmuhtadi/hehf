import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((l) => l());
  });
}

const DISMISS_KEY = 'hehf-install-dismissed';

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true);

const isIOS = () => typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * "Add HEHF to your home screen". On Android/desktop Chrome this uses the
 * browser's install prompt; on iPhone it explains the Share > Add to Home
 * Screen steps, because Safari has no prompt.
 */
export function useInstallPrompt() {
  const [, force] = useState(0);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const installed = isStandalone();
  const canPrompt = !!deferred;
  const ios = isIOS();

  return {
    /** Show the install card at all. */
    available: !installed && (canPrompt || ios),
    installed,
    canPrompt,
    ios,
    dismissed,
    dismiss: () => {
      setDismissed(true);
      try {
        localStorage.setItem(DISMISS_KEY, '1');
      } catch {
        /* private mode */
      }
    },
    install: async () => {
      if (!deferred) return false;
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferred = null;
      force((n) => n + 1);
      return choice.outcome === 'accepted';
    },
  };
}

export const OFFICE = {
  phone: '+447826541868',
  phoneLabel: '07826 541868',
  whatsapp: 'https://wa.me/447826541868?text=Hi%2C%20I%20need%20help%20with%20my%20HEHF%20account',
  email: 'info@hehf.co.uk',
};
