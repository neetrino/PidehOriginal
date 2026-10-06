import Script from 'next/script';

import { getEnv } from '@/config/env';

const TIDIO_SCRIPT_BASE_URL = 'https://code.tidio.co';

/** Loads the Tidio live chat widget after the page becomes idle. */
export function TidioChat() {
  const { TIDIO_PUBLIC_KEY } = getEnv();

  if (!TIDIO_PUBLIC_KEY) {
    return null;
  }

  return (
    <Script
      id="tidio-chat"
      src={`${TIDIO_SCRIPT_BASE_URL}/${TIDIO_PUBLIC_KEY}.js`}
      strategy="lazyOnload"
    />
  );
}
