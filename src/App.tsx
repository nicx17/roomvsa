import React from 'react';
import Scene from './components/Scene';
import ControlPanel from './components/ControlPanel';
import Loader from './components/Loader';
import { useRoomStore } from './store';
import './index.css';

function App() {
  const theme = useRoomStore((state) => state.theme);

  return (
    <div className="app-container" data-theme={theme}>
      <Loader />
      <div className="canvas-container">
        <Scene />
      </div>

      <div className="controls-overlay">
        <ControlPanel />
      </div>
    </div>
  );
}

export default App;
