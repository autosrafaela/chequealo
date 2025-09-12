import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error in subtree:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md text-center p-6 rounded-lg border bg-white shadow-sm">
            <h1 className="text-2xl font-bold mb-2 text-foreground">Hubo un problema</h1>
            <p className="text-muted-foreground mb-4">
              Ocurrió un error al cargar esta sección. Por favor, intentá recargar la página.
            </p>
            <div className="space-x-3">
              <a href="/admin" className="underline text-primary">Reintentar</a>
              <a href="/" className="underline text-primary">Ir al inicio</a>
            </div>
            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <pre className="mt-4 text-left text-xs text-red-600 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
