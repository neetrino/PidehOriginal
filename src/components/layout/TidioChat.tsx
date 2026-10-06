import Script from 'next/script';

const TIDIO_SCRIPT_SRC = 'https://code.tidio.co/8yvyl0quwowix50xtjsy8oerymuhyht5.js';

/** Loads the Tidio live chat widget after the page becomes idle. */
export function TidioChat() {
  return <Script id="tidio-chat" src={TIDIO_SCRIPT_SRC} strategy="lazyOnload" />;
}
