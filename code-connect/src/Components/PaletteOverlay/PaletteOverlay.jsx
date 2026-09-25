// src/Components/PaletteOverlay.js
import React, { useState, useEffect, useRef } from 'react';
import BlockPalette from '../BlockPalette/BlockPalette';
import './PaletteOverlay.css';

const PaletteOverlay = ({
  dummyBlockPosition,
  onClose,
  currentDummyBlockId,
  handleReplaceDummyBlock,
  isDragging,
  setIsDragging,
  setCancelDrag,
}) => {
  // Maintain a draggable position state
  const [position, setPosition] = useState(dummyBlockPosition || { top: 0, left: 0 });
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, dragging: false });

  // Sync with incoming dummyBlockPosition
  useEffect(() => {
    if (dummyBlockPosition) {
      setPosition(dummyBlockPosition);
    }
  }, [dummyBlockPosition]);

  // Start dragging from header
  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.left,
      origY: position.top,
      dragging: true,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Update position during drag
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    setPosition({
      top: dragRef.current.origY + deltaY,
      left: dragRef.current.origX + deltaX,
    });
  };

  // Stop dragging
  const onMouseUp = () => {
    dragRef.current.dragging = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  if (!position) return null;

  return (
    <div
      className="palette-overlay"
      style={{ position: 'absolute', top: position.top, left: position.left }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="palette-overlay-header" onMouseDown={onMouseDown}>
        <button
          onClick={onClose}
          className="close-button"
          title="Close"
        >
          &times;
        </button>
      </div>
      <BlockPalette
        onSelectBlock={(selectedBlockType) => {
          if (!currentDummyBlockId) return;
          handleReplaceDummyBlock(currentDummyBlockId, selectedBlockType);
        }}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        setCancelDrag={setCancelDrag}
        excludeStart={true}
      />
    </div>
  );
};

export default PaletteOverlay;