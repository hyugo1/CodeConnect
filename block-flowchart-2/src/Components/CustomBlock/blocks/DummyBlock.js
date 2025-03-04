// src/Components/CustomBlock/blocks/DummyBlock.js
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './DummyBlock.css';

const DummyBlock = ({ id, data, selected, executing, onReplace }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    const blockType = event.dataTransfer.getData('application/reactflow');
    if (blockType === 'start') {
      alert('Start blocks cannot replace dummy blocks.');
      return;
    }
    if (onReplace) {
      onReplace(id, blockType);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  // Enable keyboard users to trigger replacement
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      if (onReplace) {
        onReplace(id);
      }
    }
  };

  const handleClick = (event) => {
    event.stopPropagation();
    if (onReplace) {
      onReplace(id);
    }
  };

  return (
    <div
      className={`block-container dummy-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''} ${isDragOver ? 'drag-over' : ''}`}
      data-id={id}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Dummy block – click or drop to replace"
      onKeyPress={handleKeyPress}
    >
      <FaQuestion style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px', background: '#555' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%', background: '#555' }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
    </div>
  );
};

export default DummyBlock;