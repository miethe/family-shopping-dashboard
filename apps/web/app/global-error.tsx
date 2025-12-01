'use client';

/**
 * Global Error Boundary
 * Handles unexpected errors that occur at the root layout level
 * Required for Next.js standalone build with App Router
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg-base flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-medium p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-status-warning-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-status-warning-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-warm-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-warm-600 mb-6">
            We apologize for the inconvenience. Please try again.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-large hover:bg-primary-600 transition-colors min-h-[44px]"
          >
            Try again
          </button>
          {process.env.NODE_ENV === 'development' && error.message && (
            <pre className="mt-6 p-4 bg-warm-100 rounded-lg text-left text-xs text-warm-700 overflow-auto max-h-40">
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}
