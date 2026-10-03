'use client';

import { useEffect } from 'react';

interface IGlobalErrorProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: IGlobalErrorProps) {
  useEffect(() => {
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#0c0b09',
          color: '#f5f0e8',
          padding: 24,
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
            padding: '40px 28px',
            borderRadius: 16,
            border: '1px solid rgba(220, 80, 80, 0.35)',
            background: 'rgba(220, 80, 80, 0.08)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#e87474' }}>
            Something went wrong
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.5, opacity: 0.75 }}>
            The app hit an unexpected error. Try again — your work on other screens is safe.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: '10px 18px',
              borderRadius: 10,
              border: '1px solid rgba(201, 162, 39, 0.4)',
              background: 'transparent',
              color: '#f5f0e8',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
