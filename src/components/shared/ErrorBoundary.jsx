import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Please reload the page. If the problem continues, try again later.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 h-12 w-full rounded-lg bg-primary font-medium text-white hover:bg-primary-dark"
          >
            Reload page
          </button>
        </div>
      </div>
    );
  }
}
