'use client';

import * as React from 'react';
import html2canvas from 'html2canvas';

interface TicketActionsProps {
  ticketElementId: string;
}

export function TicketActions({ ticketElementId }: TicketActionsProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSaveAsImage = async () => {
    try {
      setIsSaving(true);
      const element = document.getElementById(ticketElementId);
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `arrivelink-ticket.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to save image:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My ArriveLink Ticket',
          text: 'Here is my ArriveLink bus ticket!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={handleSaveAsImage}
        disabled={isSaving}
        className="flex-1 px-4 py-3 bg-mist dark:bg-white/5 text-foreground font-medium font-body rounded-xl flex items-center justify-center gap-2 hover:bg-emerald/20 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {isSaving ? 'Saving...' : 'Save Image'}
      </button>
      
      <button
        onClick={handleShare}
        className="flex-1 px-4 py-3 bg-forest dark:bg-emerald text-white dark:text-foreground font-medium font-body rounded-xl flex items-center justify-center gap-2 hover:bg-pine transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>
    </div>
  );
}
