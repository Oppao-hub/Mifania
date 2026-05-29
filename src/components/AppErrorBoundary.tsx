import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ErrorState from './ErrorState';
import { getAppCrashDescription, reportAppError } from '../utils/appCrashReporting';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  retryKey: number;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
    retryKey: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportAppError(error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      retryKey: prev.retryKey + 1,
    }));
  };

  render(): ReactNode {
    const { hasError, error, retryKey } = this.state;

    if (hasError) {
      return (
        <SafeAreaView className="flex-1 bg-app-bg">
          <View className="flex-1">
            <ErrorState
              error={error}
              title="Something Went Wrong"
              description={getAppCrashDescription(error)}
              onRetry={this.handleRetry}
              retryLabel="Reload App"
            />
          </View>
        </SafeAreaView>
      );
    }

    return <React.Fragment key={retryKey}>{this.props.children}</React.Fragment>;
  }
}

export default AppErrorBoundary;
