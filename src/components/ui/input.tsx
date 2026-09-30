'use client';

import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.11 6.11m3.768 3.768a3 3 0 014.243 4.243m0 0L17.89 17.89m-3.77-3.77l3.77 3.77M6.11 6.11L3 3m3.11 3.11l4.768 4.768M17.89 17.89L21 21" />
    </svg>
  );
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isPasswordType = type === 'password';
    const [showPassword, setShowPassword] = useState(false);

    const resolvedType = isPasswordType && showPassword ? 'text' : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-body text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            className={`
              w-full px-4 py-3 rounded-xl border border-mist dark:border-white/5
              font-body text-base text-foreground placeholder:text-foreground/30
              bg-white dark:bg-dark-surface
              focus:outline-none focus:ring-2 focus:ring-pine/30 focus:border-pine
              transition-all duration-200
              disabled:bg-muted-bg disabled:text-foreground/40 disabled:cursor-not-allowed
              ${error ? 'border-error focus:ring-error/20 focus:border-error' : ''}
              ${isPasswordType ? 'pr-12' : ''}
              ${className}
            `}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-foreground/40 hover:text-foreground/70 dark:text-foreground/30 dark:hover:text-foreground/60 transition-colors focus:outline-none focus:ring-2 focus:ring-pine/30"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-foreground/40 font-body">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-error font-body flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };

