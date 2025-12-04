import Link from 'next/link';

/**
 * 404 Not Found Page
 * Displayed when a page is not found
 */

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-medium p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-warm-100 rounded-full flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <h1 className="text-xl font-bold text-warm-900 mb-2">
          Page not found
        </h1>
        <p className="text-warm-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-large hover:bg-primary-600 transition-colors min-h-[44px]"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
