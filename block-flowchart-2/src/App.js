// src/App.js

import React, { useState, useCallback } from 'react';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import FlowchartCanvas from './Components/FlowchartCanvas';
import CharacterDisplay from './Components/CharacterDisplay/CharacterDisplay';
import Console from './Components/Console/Console';
import Navbar from './Components/Navbar/Navbar'; // Import Navbar
import './styles/App.css';

function App() {
  // State for character and console
  const [consoleOutput, setConsoleOutput] = useState('');
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterMessage, setCharacterMessage] = useState('');

  // **Drag State**
  const [isDragging, setIsDragging] = useState(false);
  const [cancelDrag, setCancelDrag] = useState(false);

  // **Flowchart State**
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Handler for selecting a block from the palette
  const handleSelectBlock = useCallback((blockType) => {
    // Implement logic if needed when a block is selected from the left palette
    console.log(`Block selected from left palette: ${blockType}`);
  }, []);

  return (
    <div className="App">
      {/* **Navbar at the Top** */}
      <Navbar
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {/* **Main Content** */}
      <div className="app-container">
        {/* **Left BlockPalette** */}
        <BlockPalette
          onSelectBlock={handleSelectBlock}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />

        {/* **Middle Flowchart Canvas** */}
        <FlowchartCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          consoleOutput={consoleOutput}
          setConsoleOutput={setConsoleOutput}
          characterPosition={characterPosition}
          setCharacterPosition={setCharacterPosition}
          characterMessage={characterMessage}
          setCharacterMessage={setCharacterMessage}
          isDragging={isDragging}
          cancelDrag={cancelDrag}
          setCancelDrag={setCancelDrag}
          setIsDragging={setIsDragging}
        />

        {/* **Right Panel** */}
        <div className="right-panel">
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