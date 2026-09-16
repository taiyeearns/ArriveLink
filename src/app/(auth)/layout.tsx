import { Logo } from '@/components/ui/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-dark-bg px-4">
      {/* Decorative top bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest via-pine to-emerald" />

      {/* Logo */}
      <div className="mb-8">
        <Logo variant="full" size="lg" />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-foreground/40 font-body text-center">
        Plan It. Book It. Arrive.
      </p>
    </div>
  );
}
