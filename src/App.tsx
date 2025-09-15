import React from 'react';
import { DebugProvider } from './contexts/DebugContext';
import { WorkoutAppContent } from './components/WorkoutAppContent';

function App() {
  return (
    <DebugProvider>
      <WorkoutAppContent />
    </DebugProvider>
  );
}

export default App;