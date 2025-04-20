// src/Components/RightPanel/RightPanel.js
import React, { useState, useEffect, useRef } from 'react';
import CharacterDisplay from '../CharacterDisplay/CharacterDisplay';
import CodePreview from '../CodePreview';
import Console from '../Console/Console';
import './RightPanel.css';

const RightPanel = ({
  characterMessage,
  characterPosition,
  rotation,
  blocks,
  edges,
  consoleOutput
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [width,     setWidth]     = useState(350); 
  const [resizing,  setResizing]  = useState(false);
  const startXRef    = useRef(0);
  const startWidthRef= useRef(0);

  // user pressed down on the left gutter
  const onMouseDownResizer = e => {
    e.preventDefault();
    setResizing(true);
    startXRef.current     = e.clientX;
    startWidthRef.current = width;
  };

  // track global mousemove & mouseup
  useEffect(() => {
    const onMouseMove = e => {
      if (!resizing) return;
      // gutter on left → dragging right (↑ clientX) should decrease width
      const delta = startXRef.current - e.clientX;
      const newW = Math.max(60, Math.min(startWidthRef.current + delta, 800));
      setWidth(newW);
    };
    const onMouseUp = () => {
      if (resizing) setResizing(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [resizing]);

  return (
    <div
      className={
        `right-panel ` +
        (collapsed ? 'collapsed ' : '') +
        (resizing  ? 'resizing'  : '')
      }
      style={{ width: collapsed ? 60 : width }}
    >
      {/* only show drag‑handle when not collapsed */}
      {!collapsed && (
        <div
          className="resizer-left"
          onMouseDown={onMouseDownResizer}
        />
      )}

      <button
        className="collapse-button"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? "Expand panel" : "Collapse panel"}
      >
        {collapsed ? '<' : '>'}
      </button>

      {!collapsed && (
        <>
          <CharacterDisplay
            characterMessage={characterMessage}
            characterPosition={characterPosition}
            rotation={rotation}
          />
          <CodePreview blocks={blocks} edges={edges} />
          <Console consoleOutput={consoleOutput} />
        </>
      )}
    </div>
  );
};

export default RightPanel;