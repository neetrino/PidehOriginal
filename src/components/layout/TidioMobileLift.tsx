'use client';

import { useEffect } from 'react';

const MOBILE_QUERY = '(max-width: 767px), (orientation: portrait) and (max-width: 1199px)';
/** Dock is 176px in the 440px frame, then scaled to the viewport, plus a gap. */
const LIFT = 'calc(176px * 100vw / 440 + env(safe-area-inset-bottom, 0px) + 1.25rem)';

function liftBubble(iframe: HTMLElement): void {
  const wanted = LIFT.replaceAll(/\s/g, '');
  const current = iframe.style.getPropertyValue('bottom').replaceAll(/\s/g, '');
  if (current === wanted && iframe.style.getPropertyPriority('bottom') === 'important') {
    return;
  }
  iframe.style.setProperty('bottom', LIFT, 'important');
  iframe.style.setProperty('top', 'auto', 'important');
}

/** Keeps the Tidio launcher above the mobile dock after Tidio resets its inline position. */
export function TidioMobileLift() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    let styleObserver: MutationObserver | undefined;

    const apply = () => {
      if (!media.matches) {
        return;
      }
      const iframe = document.getElementById('tidio-chat-iframe');
      if (!(iframe instanceof HTMLElement)) {
        return;
      }
      liftBubble(iframe);
      mountObserver.disconnect();
      if (styleObserver) {
        return;
      }
      styleObserver = new MutationObserver(apply);
      styleObserver.observe(iframe, { attributes: true, attributeFilter: ['style'] });
    };

    const mountObserver = new MutationObserver(apply);
    mountObserver.observe(document.body, { childList: true, subtree: true });
    apply();
    document.addEventListener('tidioChat-ready', apply);
    media.addEventListener('change', apply);

    return () => {
      document.removeEventListener('tidioChat-ready', apply);
      media.removeEventListener('change', apply);
      mountObserver.disconnect();
      styleObserver?.disconnect();
    };
  }, []);

  return null;
}
