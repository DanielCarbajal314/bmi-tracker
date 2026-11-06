import { Component, type ErrorInfo } from 'react';
import { ErrorFallback } from './components/ErrorFallback';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types/error-boundary.types';

// A class on purpose: React has no hook to catch an error thrown while rendering.
// It keeps the state and hands the screen to ErrorFallback.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  private readonly retry = (): void => {
    this.setState({ failed: false });
  };

  render() {
    return this.state.failed ? <ErrorFallback onRetry={this.retry} /> : this.props.children;
  }
}
