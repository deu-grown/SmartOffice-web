// 최상위 ErrorBoundary. 라우터 트리 외부에서 발생한 렌더링 에러를 잡아 fallback UI 로 대체한다.
// 비동기/이벤트 핸들러 에러는 잡지 않으므로 그쪽은 toast/api error 로 별도 처리한다.
import * as React from "react";
import type { ErrorInfo, PropsWithChildren, ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  PropsWithChildren<ErrorBoundaryProps>,
  ErrorBoundaryState
> {
  // tsconfig 의 useDefineForClassFields:false 와 호환되도록 클래스 필드로 직접 초기화.
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 운영 환경에서는 외부 로깅으로 보낼 수 있도록 콜백 제공.
    this.props.onError?.(error, info);
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("[ErrorBoundary]", error, info);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-canvas p-6 font-sans">
          <div className="w-full max-w-md bg-surface rounded-4xl shadow-card border border-border p-10 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-error-bg text-error-fg rounded-2xl flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">문제가 발생했습니다</h1>
              <p className="text-sm text-muted-foreground">
                예상치 못한 오류로 화면을 표시할 수 없습니다. 잠시 후 다시 시도해 주세요.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              처음으로 돌아가기
            </button>
          </div>
        </div>
      );
    }
    return <>{this.props.children}</>;
  }
}
