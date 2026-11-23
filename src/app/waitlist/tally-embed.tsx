'use client';

import { useEffect } from 'react';

export function TallyEmbed() {
  useEffect(() => {
    // Load Tally widget script for dynamic height resizing
    const w = 'https://tally.so/widgets/embed.js';
    const existingScript = document.querySelector(`script[src="${w}"]`);

    function initTally() {
      const win = window as unknown as { Tally?: { loadEmbeds: () => void } };
      if (typeof win.Tally !== 'undefined') {
        win.Tally.loadEmbeds();
      } else {
        // Fallback: set src on iframes that only have data-tally-src
        document
          .querySelectorAll('iframe[data-tally-src]:not([src])')
          .forEach((el) => {
            const iframe = el as HTMLIFrameElement;
            iframe.src = iframe.dataset.tallySrc || '';
          });
      }
    }

    if (existingScript) {
      initTally();
    } else {
      const s = document.createElement('script');
      s.src = w;
      s.onload = initTally;
      s.onerror = initTally;
      document.body.appendChild(s);
    }
  }, []);

  return (
    <iframe
      data-tally-src="https://tally.so/embed/EqxvgB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&formEventsForwarding=1"
      src="https://tally.so/embed/EqxvgB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&formEventsForwarding=1"
      loading="lazy"
      width="100%"
      height="400"
      frameBorder="0"
      marginHeight={0}
      marginWidth={0}
      title="December holiday travel bus-booking waitlist"
      style={{ border: 0, minHeight: 400 }}
    />
  );
}
