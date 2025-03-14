// src/Components/PaletteOverlay.js

import React from 'react';
import BlockPalette from './BlockPalette/BlockPalette';

const PaletteOverlay = ({
  dummyBlockPosition,
  setPaletteVisible,
  currentDummyBlockId,
  handleReplaceDummyBlock,
  isDragging,
  setIsDragging,
  setCancelDrag,
}) => {
  if (!dummyBlockPosition) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: dummyBlockPosition.top,
        left: dummyBlockPosition.left,
        zIndex: 1000,
        backgroundColor: 'rgba(255,255,255,0.9)',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.3)',
        borderRadius: '4px',
        padding: '10px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setPaletteVisible(false)}
        className="close-button"
        title="Close"
      >
        &times;
      </button>
      <BlockPalette
        onSelectBlock={(selectedBlockType) => {
          if (!currentDummyBlockId) return;
          handleReplaceDummyBlock(currentDummyBlockId, selectedBlockType);
        }}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        setCancelDrag={setCancelDrag}
        excludeStart={true}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default PaletteOverlay;