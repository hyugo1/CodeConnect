// src/App.js
import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import FlowchartCanvas from './Components/FlowchartCanvas';
import CharacterDisplay from './Components/CharacterDisplay/CharacterDisplay';
import Console from './Components/Console/Console';
import Navbar from './Components/Navbar/Navbar';
import CodePreview from './Components/CodePreview';
import './styles/App.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  // State for character and console
  const [consoleOutput, setConsoleOutput] = useState('');
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterMessage, setCharacterMessage] = useState('');

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [cancelDrag, setCancelDrag] = useState(false);

  // Flowchart State
  const [blocks, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Handler for selecting a block from the palette
  const handleSelectBlock = useCallback((blockType) => {
    console.log(`Block selected from left palette: ${blockType}`);
  }, []);

  return (
    <div className="App">
      {/* **Navbar at the Top** */}
      <Navbar
        blocks={blocks}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {/* **Toast Notifications** */}
      <ToastContainer />

      {/* **Main Content** */}
      <div className="app-container">
        {/* **Left BlockPalette** */}
        <BlockPalette
          onSelectBlock={handleSelectBlock}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
        {/* Wrap the FlowchartCanvas in the ReactFlowProvider */}
        {/* **Middle Flowchart Canvas** */}
        <ReactFlowProvider>
          <FlowchartCanvas
            blocks={blocks}
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
        </ReactFlowProvider>

        {/* **Right Panel** */}
        <div className="right-panel">
          <CharacterDisplay
            characterMessage={characterMessage}
            characterPosition={characterPosition}
          />
          <Console consoleOutput={consoleOutput} />
          {/* Add the CodePreview component below the character display */}
          <CodePreview blocks={blocks} edges={edges} />
        </div>
      </div>
    </div>
  );
}

export default App;