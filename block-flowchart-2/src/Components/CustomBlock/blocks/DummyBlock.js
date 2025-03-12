// src/Components/blocks/DummyBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const DummyBlock = ({ id, data, selected, executing, onReplace }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This is a temporary placeholder block. 
• It shows where you can add a new command later. To replace it, simply drag your chosen block onto it or click it to select a new block..`;

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
        onClick={(e) => {
          e.stopPropagation();
          setShowHelp(true);
        }}
        className="help-button"
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