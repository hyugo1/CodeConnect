// src/contexts/ActiveFlowContext.js

import { createContext, useContext, useState, useCallback } from 'react';

export const ActiveFlowContext = createContext({
  // Execution state
  activeBlockId: null,
  activeEdgeId: null,
  errorBlockId: null,
  isExecuting: false,
  
  // Block replacement state
  paletteVisible: false,
  currentDummyBlockId: null,
  dummyBlockPosition: null,
  
  // Handlers
  setActiveBlockId: () => {},
  setActiveEdgeId: () => {},
  setErrorBlockId: () => {},
  setIsExecuting: () => {},
  onReplace: () => {},
  closePalette: () => {},
});

export const useActiveFlow = () => useContext(ActiveFlowContext);

/**
 * Provider component that wraps the app and provides active flow context.
 * Centralizes state that was previously spread across multiple components.
 */
export function ActiveFlowProvider({ children }) {
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [activeEdgeId, setActiveEdgeId] = useState(null);
  const [errorBlockId, setErrorBlockId] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Block replacement state
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [currentDummyBlockId, setCurrentDummyBlockId] = useState(null);
  const [dummyBlockPosition, setDummyBlockPosition] = useState(null);

  const onReplace = useCallback((dummyId, e) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDummyBlockPosition({ top: rect.top, left: rect.right + 10 });
    } else {
      setDummyBlockPosition({ top: 100, left: 100 });
    }
    setCurrentDummyBlockId(dummyId);
    setPaletteVisible(true);
  }, []);

  const closePalette = useCallback(() => {
    setPaletteVisible(false);
    setCurrentDummyBlockId(null);
    setDummyBlockPosition(null);
  }, []);

  const value = {
    // Execution state
    activeBlockId,
    activeEdgeId,
    errorBlockId,
    isExecuting,
    setActiveBlockId,
    setActiveEdgeId,
    setErrorBlockId,
    setIsExecuting,
    
    // Block replacement state
    paletteVisible,
    currentDummyBlockId,
    dummyBlockPosition,
    onReplace,
    closePalette,
  };

  return (
    <ActiveFlowContext.Provider value={value}>
      {children}
    </ActiveFlowContext.Provider>
  );
}

export default ActiveFlowContext;