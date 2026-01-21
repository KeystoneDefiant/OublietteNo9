interface ErrorScreenProps {
  error?: Error;
  errorMessage?: string;
  onRetry?: () => void;
  onReload?: () => void;
  showDetails?: boolean;
}

/**
 * User-friendly error display component
 * Can be used as a fallback for ErrorBoundary or for displaying specific errors
 */
export function ErrorScreen({
  error,
  errorMessage = 'An unexpected error occurred',
  onRetry,
  onReload = () => window.location.reload(),
  showDetails = import.meta.env.DEV,
}: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
        <div className="flex items-center mb-6">
          <div className="bg-red-100 rounded-full p-3 mr-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Oops!</h1>
        </div>

        <p className="text-lg text-gray-700 mb-4">{errorMessage}</p>

        <p className="text-gray-600 mb-6">
          Don't worry, your progress is safe. You can try again or reload the page to continue
          playing.
        </p>

        {showDetails && error && (
          <details className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
              Technical details
            </summary>
            <div className="mt-3">
              <p className="text-sm font-semibold text-gray-600 mb-1">Error message:</p>
              <pre className="text-xs text-red-700 overflow-auto bg-white p-2 rounded border">
                {error.message}
              </pre>
              {error.stack && (
                <>
                  <p className="text-sm font-semibold text-gray-600 mb-1 mt-3">Stack trace:</p>
                  <pre className="text-xs text-gray-600 overflow-auto bg-white p-2 rounded border max-h-40">
                    {error.stack}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          )}
          <button
            onClick={onReload}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
