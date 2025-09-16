import React from 'react';
import { DebugProvider } from './contexts/DebugContext';
import { WorkoutAppContent } from './components/WorkoutAppContent';
// import { WorkoutAppContent } from './components/WorkoutAppContentV2';
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