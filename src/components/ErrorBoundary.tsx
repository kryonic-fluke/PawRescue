import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Send error to parent window for debugging
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "ERROR_CAPTURED",
            error: {
              message: error.message,
              stack: error.stack,
              componentStack: errorInfo.componentStack,
              source: "ErrorBoundary",
            },
            timestamp: Date.now(),
          },
          "*"
        );
      }
    } catch (e) {
      console.error("Failed to send error to parent:", e);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-2xl w-full bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground">
                  The application encountered an error
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="space-y-4">
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold text-destructive mb-2">
                    Error Message:
                  </h3>
                  <pre className="text-sm text-destructive/90 whitespace-pre-wrap break-words">
                    {this.state.error.message}
                  </pre>
                </div>

                {this.state.error.stack && (
                  <details className="bg-muted rounded-lg p-4">
                    <summary className="font-semibold cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Stack Trace
                    </summary>
                    <pre className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap break-words overflow-x-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}

                {this.state.errorInfo?.componentStack && (
                  <details className="bg-muted rounded-lg p-4">
                    <summary className="font-semibold cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      Component Stack
                    </summary>
                    <pre className="mt-3 text-xs text-muted-foreground whitespace-pre-wrap break-words overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button onClick={this.handleReset} className="flex-1">
                Reload Application
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
