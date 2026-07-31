"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an exception:", error, errorInfo);
    }
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="virlio-card p-6 my-4 bg-white border border-red-200 shadow-xs rounded-2xl max-w-md mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-gray-900 tracking-tight mb-1">
            Something went wrong
          </h3>

          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            An unexpected component error occurred while rendering this section.
          </p>

          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
