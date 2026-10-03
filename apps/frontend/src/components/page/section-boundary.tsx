'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { ErrorState } from '@/components/page/error-state';

interface ISectionBoundaryProps {
  readonly children: ReactNode;
  readonly title?: string;
  readonly description?: string;
  readonly onReset?: () => void;
  readonly className?: string;
  readonly compact?: boolean;
}

interface IBoundaryProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly retryLabel: string;
  readonly onReset: () => void;
  readonly className?: string;
  readonly compact?: boolean;
}

interface IBoundaryState {
  readonly hasError: boolean;
}

class SectionErrorCatcher extends Component<IBoundaryProps, IBoundaryState> {
  state: IBoundaryState = { hasError: false };

  static getDerivedStateFromError(): IBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[SectionBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = () => {
    this.props.onReset();
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title={this.props.title}
          description={this.props.description}
          retryLabel={this.props.retryLabel}
          onRetry={this.handleRetry}
          compact={this.props.compact}
          className={this.props.className}
        />
      );
    }
    return this.props.children;
  }
}

export function SectionBoundary({
  children,
  title,
  description,
  onReset,
  className,
  compact,
}: ISectionBoundaryProps) {
  const t = useTranslations('common');
  const resolvedTitle = title ?? t('sectionErrorTitle');
  const resolvedDescription = description ?? t('sectionErrorDescription');
  const retryLabel = t('retry');

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <SectionErrorCatcher
          title={resolvedTitle}
          description={resolvedDescription}
          retryLabel={retryLabel}
          onReset={() => {
            reset();
            onReset?.();
          }}
          className={className}
          compact={compact}
        >
          {children}
        </SectionErrorCatcher>
      )}
    </QueryErrorResetBoundary>
  );
}
