import { type ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface PageWrapperProps {
  children: ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-full">
        {children}
      </div>
    </ErrorBoundary>
  );
}

