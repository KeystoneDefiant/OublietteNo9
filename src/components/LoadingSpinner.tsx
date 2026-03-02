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
    ? 'min-h-screen min-h-[100dvh] flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div
      className={containerClasses}
      style={
        fullScreen
          ? { background: 'linear-gradient(180deg, #050508 0%, #0d0a0c 100%)' }
          : undefined
      }
    >
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-4 rounded-full animate-spin`}
          style={{
            borderColor: 'var(--game-border)',
            borderTopColor: 'var(--game-accent-gold)',
          }}
        />
      </div>
      {message && (
        <p
          className="mt-4 text-base sm:text-lg font-medium animate-pulse"
          style={{ color: 'var(--game-text-muted)' }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
