import React from 'react';
import { DebugProvider } from './contexts/DebugContext';
import { WorkoutAppContent } from './components/WorkoutAppContent';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <DebugProvider>
        <WorkoutAppContent />
      </DebugProvider>
    </ErrorBoundary>
  );
}

export default App;