'use client';

import { useEffect, useRef } from 'react';

export function TallyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Tally widget script
    const existingScript = document.querySelector('script[src="https://tally.so/widgets/embed.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://tally.so/widgets/embed.js';
      script.async = true;
      script.onload = () => {
        if (typeof (window as unknown as { Tally?: { loadEmbeds: () => void } }).Tally !== 'undefined') {
          (window as unknown as { Tally: { loadEmbeds: () => void } }).Tally.loadEmbeds();
        }
      };
      document.body.appendChild(script);
    } else {
      // Script already loaded, just trigger embed loading
      if (typeof (window as unknown as { Tally?: { loadEmbeds: () => void } }).Tally !== 'undefined') {
        (window as unknown as { Tally: { loadEmbeds: () => void } }).Tally.loadEmbeds();
      }
    }
  }, []);

  return (
    <div ref={containerRef}>
      <iframe
        data-tally-src="https://tally.so/embed/EqxvgB?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1&formEventsForwarding=1"
        loading="lazy"
        width="100%"
        height="400"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="December holiday travel bus-booking waitlist"
        style={{ border: 0 }}
      />
    </div>
  );
}
