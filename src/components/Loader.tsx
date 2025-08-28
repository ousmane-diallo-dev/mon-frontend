import React from "react";

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'skeleton';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  className?: string;
}

const Loader = ({ 
  size = 'md', 
  variant = 'spinner', 
  color = 'primary',
  text,
  className = "" 
}: LoaderProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${sizeClasses[size]} ${colorClasses[color]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${colorClasses[color]} animate-pulse`}
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`animate-pulse rounded-full bg-current ${sizeClasses[size]} ${colorClasses[color]}`} />
  );

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1 h-4 rounded-full ${colorClasses[color]} animate-pulse`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderSkeleton = () => (
    <div className="space-y-3">
      <div className={`animate-pulse bg-gray-200 rounded ${sizeClasses[size]}`} />
      <div className="animate-pulse bg-gray-200 rounded h-4 w-3/4" />
      <div className="animate-pulse bg-gray-200 rounded h-4 w-1/2" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]} text-center`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Composants spécialisés pour des cas d'usage courants
export const PageLoader = ({ text = "Chargement..." }: { text?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <Loader size="lg" variant="spinner" text={text} />
  </div>
);

export const CardLoader = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
    <Loader variant="skeleton" className="w-full" />
  </div>
);

export const ButtonLoader = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => (
  <Loader size={size} variant="spinner" color="white" />
);

export const InlineLoader = ({ text }: { text?: string }) => (
  <Loader size="sm" variant="dots" text={text} />
);

export default Loader;