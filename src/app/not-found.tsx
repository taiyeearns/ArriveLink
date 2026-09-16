import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mist to-white flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-6">
          <Logo variant="icon" size="lg" />
        </div>

        <div className="mb-6">
          <p className="font-display text-7xl font-bold text-foreground/10 mb-2">404</p>
          <h1 className="font-display text-xl font-bold text-foreground mb-2">
            Page not found
          </h1>
          <p className="text-sm text-foreground/50 font-body">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Link href="/">
            <button className="w-full px-5 py-3 bg-forest text-white rounded-xl font-body text-sm font-medium hover:bg-pine transition-colors cursor-pointer">
              Go Home
            </button>
          </Link>
          <Link href="/history">
            <button className="w-full px-5 py-3 bg-muted-bg text-foreground rounded-xl font-body text-sm font-medium hover:bg-mist transition-colors cursor-pointer">
              View My Bookings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
