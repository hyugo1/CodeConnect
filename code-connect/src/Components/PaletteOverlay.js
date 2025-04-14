// src/Components/PaletteOverlay.js

import React from 'react';
import BlockPalette from './BlockPalette/BlockPalette';
import './PaletteOverlay.css';

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
      className="palette-overlay"
      style={{
        top: dummyBlockPosition.top,
        left: dummyBlockPosition.left,
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