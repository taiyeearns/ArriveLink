'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitRating } from '@/lib/rating-actions';

interface RateButtonProps {
  bookingId: string;
  existingRating?: number | null;
}

export function RateButton({ bookingId, existingRating }: RateButtonProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selected, setSelected] = useState(existingRating || 0);
  const [loading, setLoading] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [done, setDone] = useState(!!existingRating);
  const router = useRouter();

  async function handleRate(stars: number) {
    setSelected(stars);
    setLoading(true);

    const result = await submitRating(bookingId, stars);
    setLoading(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= selected ? 'text-amber-500' : 'text-foreground/20'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  if (!showStars) {
    return (
      <button
        onClick={() => setShowStars(true)}
        className="px-3 py-1.5 text-xs text-emerald font-medium font-body hover:bg-emerald/10 rounded-lg transition-colors cursor-pointer"
      >
        Rate Trip
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(0)}
          onClick={() => handleRate(star)}
          disabled={loading}
          className="cursor-pointer p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
        >
          <svg
            className={`w-5 h-5 transition-colors ${
              star <= (hoveredStar || selected) ? 'text-amber-500' : 'text-foreground/20'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
