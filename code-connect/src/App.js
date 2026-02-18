// src/App.js

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { ReactFlowProvider } from 'reactflow';
import BlockPalette from './Components/BlockPalette/BlockPalette';
import Canvas from './Components/Canvas/Canvas';
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
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme-mode') || 'system');
  const [prefersDark, setPrefersDark] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  const reactFlowWrapper = useRef(null);

  const effectiveColorMode = useMemo(() => {
    if (themeMode === 'system') {
      return prefersDark ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, prefersDark]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const onMediaChange = (event) => setPrefersDark(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onMediaChange);
    } else {
      mediaQuery.addListener(onMediaChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onMediaChange);
      } else {
        mediaQuery.removeListener(onMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
    document.body.classList.toggle('dark-mode', effectiveColorMode === 'dark');
  }, [themeMode, effectiveColorMode]);

  const handleSelectBlock = useCallback((blockType) => {
    console.log(`Block selected from left palette: ${blockType}`);
  }, []);

  return (
    <div className="App">
      <Navbar
        blocks={blocks}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
        reactFlowWrapperRef={reactFlowWrapper}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
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
            colorMode={effectiveColorMode}
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