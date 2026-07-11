'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  forceTheme?: 'light' | 'dark';
}

const sizeMap = {
  sm: { full: { w: 120, h: 32 }, icon: { w: 28, h: 28 } },
  md: { full: { w: 160, h: 42 }, icon: { w: 36, h: 36 } },
  lg: { full: { w: 200, h: 52 }, icon: { w: 48, h: 48 } },
};

function Logo({ variant = 'full', size = 'md', className = '', forceTheme }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dimensions = sizeMap[size][variant];
  const alt = variant === 'full' ? 'ArriveLink' : 'ArriveLink icon';

  // Determine which image to show
  // Before mounting, assume light mode to prevent hydration mismatch
  const isSystemDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');
  const isDark = forceTheme ? forceTheme === 'dark' : isSystemDark;

  // Logic: 
  // Full logo light mode -> arrivelink-logo-dark.png (dark text)
  // Full logo dark mode -> arrivelink-logo-light.png (light text)
  // Icon light mode -> arrivelink-mark-light.png (saturated emerald)
  // Icon dark mode -> arrivelink-mark-dark.png (pale mint)
  const fullSrc = isDark ? '/arrivelink-logo-light.png' : '/arrivelink-logo-dark.png';
  const iconSrc = isDark ? '/arrivelink-mark-dark.png' : '/arrivelink-mark-light.png';
  const src = variant === 'full' ? fullSrc : iconSrc;

  // We add a key to force re-render of the image tag if src changes
  return (
    <Image
      key={src}
      src={src}
      alt={alt}
      width={dimensions.w}
      height={dimensions.h}
      className={`object-contain ${className} ${!mounted ? 'invisible' : ''}`}
      priority
    />
  );
}

export { Logo };
export type { LogoProps };
