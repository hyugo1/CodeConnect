// src/App.js

import React, { useState, useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import FlowchartCanvas from './Components/FlowchartCanvas';
import Navbar from './Components/Navbar/Navbar';
import RightPanel from './Components/RightPanel/RightPanel';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast'; 

function App() {
  const [consoleOutput, setConsoleOutput] = useState('');
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const [characterMessage, setCharacterMessage] = useState('');
  const [characterRotation, setCharacterRotation] = useState(0);

  const [isDragging, setIsDragging] = useState(false);
  const [cancelDrag, setCancelDrag] = useState(false);

  // Flowchart state
  const [blocks, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const reactFlowWrapper = useRef(null);

  const handleSelectBlock = useCallback((blockType) => {
    console.log(`Block selected from left palette: ${blockType}`);
  }, []);

  return (
    <div className="App">
      <Navbar blocks={blocks} edges={edges} setNodes={setNodes} setEdges={setEdges} reactFlowWrapperRef={reactFlowWrapper}/>
      <Toaster/>
      <ToastContainer />
      <div className="app-container">
        <BlockPalette
          onSelectBlock={handleSelectBlock}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
          setCancelDrag={setCancelDrag}
        />
        <ReactFlowProvider>
        <div className="flowchart-wrapper" ref={reactFlowWrapper}>
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
            characterRotation={characterRotation}
            setCharacterRotation={setCharacterRotation}
            isDragging={isDragging}
            cancelDrag={cancelDrag}
            setCancelDrag={setCancelDrag}
            setIsDragging={setIsDragging}
          />
          </div>
        </ReactFlowProvider>
        <RightPanel
          characterMessage={characterMessage}
          characterPosition={characterPosition}
          rotation={characterRotation}
          blocks={blocks}
          edges={edges}
          consoleOutput={consoleOutput}
        />
      </div>
    </div>
  );
}

export default App;