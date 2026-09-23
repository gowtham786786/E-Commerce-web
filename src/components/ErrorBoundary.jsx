import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-accent px-4 py-12 text-neutral-dark text-center">
          <div className="bg-white p-8 rounded-2xl shadow-soft max-w-md w-full border border-neutral-light">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-2xl font-bold text-neutral-dark mb-2">Something went wrong</h1>
            <p className="text-neutral text-sm mb-6">
              An unexpected error occurred while rendering the page.
            </p>
            {this.state.error?.message && (
              <div className="bg-neutral-light/50 p-3 rounded-lg text-left text-xs font-mono text-neutral-dark mb-6 overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="bg-neutral-light hover:bg-neutral-200 text-neutral-dark px-5 py-2.5 rounded-xl font-medium text-sm transition-colors inline-flex items-center"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
