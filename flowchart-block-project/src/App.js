// src/App.js
import React from 'react';
import Canvas from './components/Canvas';
import OutputArea from './components/OutputArea';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './components/Block.css';
import Draggable from 'react-draggable';

const App = () => {
  return (
    <Draggable>
      <DndProvider backend={HTML5Backend}>
        <div style={{ display: 'flex', height: '100vh' }}>
          {/* Left Panel (Block Palette) */}
          <div
            style={{
              width: '250px',
              padding: '20px',
              borderRight: '2px solid #ccc',
              overflowY: 'auto',
            }}
          >
            <h2>Blocks Palette</h2>
            <Canvas isPalette={true} />
          </div>

          {/* Center Panel (Flowchart Canvas) */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              borderRight: '2px solid #ccc',
            }}
          >
            <h2>Place the Blocks!</h2>
            <Canvas isPalette={false} />
          </div>

          {/* Right Panel (Output Area) */}
          <div
            style={{
              width: '250px',
              padding: '20px',
              overflowY: 'auto',
            }}
          >
            <h2>Output Area</h2>
            <OutputArea />
          </div>
        </div>
      </DndProvider>
    </Draggable>
  );
};

export default App;