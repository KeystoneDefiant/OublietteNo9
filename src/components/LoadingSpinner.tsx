interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

/**
 * Loading spinner component
 */
export function LoadingSpinner({
  message = 'Loading...',
  size = 'medium',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const containerClasses = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        ></div>
      </div>
      {message && (
        <p className="mt-4 text-lg text-gray-700 font-medium animate-pulse">{message}</p>
      )}
    </div>
  );
}
