import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Center } from '@chakra-ui/react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Center>
          <Alert.Root status="error" mb={2}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Something went wrong</Alert.Title>
            </Alert.Content>
            <Button size="sm" variant="outline" onClick={this.handleReset}>
              Try again
            </Button>
          </Alert.Root>
        </Center>
      );
    }

    return this.props.children;
  }
}
