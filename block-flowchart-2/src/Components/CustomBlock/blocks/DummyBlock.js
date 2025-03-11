import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const DummyBlock = ({ id, data, selected, executing, onReplace }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This is a temporary block.
• Click or drag another block onto this block to replace it.`;

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onReplace) onReplace(id);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (onReplace) onReplace(id);
  };

  return (
    <div
      className={`block-container dummy-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      data-id={id}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Dummy block – click or drop to replace"
    >
      <button
        onClick={(e) => { e.stopPropagation(); setShowHelp(true); }}
        style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: '#555',
        }}
        title="How to use this block"
      >
        <FaQuestion />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Dummy Block Help"
        onClose={() => setShowHelp(false)}
      />
      <div>{data.label || 'Dummy Block'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to next block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
    </div>
  );
};

export default DummyBlock;