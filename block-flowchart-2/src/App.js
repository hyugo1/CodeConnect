// src/App.js

import React, { useState } from 'react';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import FlowchartCanvas from './Components/FlowchartCanvas';
import CharacterDisplay from './Components/CharacterDisplay';
import Console from './Components/Console';
import './styles/App.css';

function App() {
  // State for character and console
  const [consoleOutput, setConsoleOutput] = useState('');
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterMessage, setCharacterMessage] = useState('');

  return (
    <div className="App">
      <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
        {/* Left BlockPalette */}
        <BlockPalette onSelectBlock={() => {}} /> {/* Pass the actual onSelectBlock handler as needed */}

        {/* Middle Flowchart Canvas */}
        <FlowchartCanvas
          consoleOutput={consoleOutput}
          setConsoleOutput={setConsoleOutput}
          characterPosition={characterPosition}
          setCharacterPosition={setCharacterPosition}
          characterMessage={characterMessage}
          setCharacterMessage={setCharacterMessage}
        />

        {/* Right Panel */}
        <div className="right-panel" style={{ backgroundColor: '#f0f0f0' }}>
          <CharacterDisplay
            characterMessage={characterMessage}
            characterPosition={characterPosition}
          />
          <Console consoleOutput={consoleOutput} />
        </div>
      </div>
    </div>
  );
}

export default App;