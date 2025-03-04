import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from 'reactflow';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import FlowchartCanvas from './Components/FlowchartCanvas';
import Navbar from './Components/Navbar/Navbar';
import RightPanel from './Components/RightPanel/RightPanel';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
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
      {/* Navbar at the Top */}
      <Navbar
        blocks={blocks}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Main Content */}
      <div className="app-container">
        {/* Left BlockPalette */}
        <BlockPalette
          onSelectBlock={handleSelectBlock}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
        {/* Flowchart Canvas */}
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

        {/* Right Panel */}
        <RightPanel
          characterMessage={characterMessage}
          characterPosition={characterPosition}
          blocks={blocks}
          edges={edges}
          consoleOutput={consoleOutput}
        />
      </div>
    </div>
  );
}

export default App;