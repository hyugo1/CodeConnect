// src/App.js

import React, { useState, useCallback, useRef } from 'react';
import { ReactFlowProvider } from 'reactflow';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import Canvas from './Components/Canvas/Canvas';
import Navbar from './Components/Navbar/Navbar';
import RightPanel from './Components/RightPanel/RightPanel';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast'; 
import InputModal from './Components/Modal/InputModal';
import { useFlowchartExecutor } from './hooks/useFlowchartExecutor';

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

  const {
    executeFlowchart,
    inputRequest,
  } = useFlowchartExecutor

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
          <Canvas
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
      <InputModal
        open={!!inputRequest}
        promptText={inputRequest?.promptText}
        onSubmit={val => inputRequest.resolve(val)}
        onCancel={() => inputRequest.resolve(null)} 
      />
    </div>
  );
}

export default App;