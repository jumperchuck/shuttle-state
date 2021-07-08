import React from 'react';
import GlobalState from './GlobalState';
import ContextState from './ContextState';

function App() {
  return (
    <div>
      <GlobalState />
      <br />
      <ContextState />
    </div>
  );
}

export default App;
