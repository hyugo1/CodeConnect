import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const DummyBlock = ({ id, data, selected, executing, onReplace }) => {
  // Called when a draggable block is dropped onto this dummy block
  const handleDrop = (event) => {
    event.preventDefault();
    const blockType = event.dataTransfer.getData('application/reactflow');
    if (blockType === 'start') {
      alert('Start blocks cannot replace dummy blocks.');
      return;
    }
    // Call the onReplace callback (if provided) with this dummy block’s id and the dropped block type.
    if (onReplace) {
      onReplace(id, blockType);
    }
  };

  // Allow drops on this element
  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div
      className={`block-container dummy-block ${selected ? 'selected' : ''} ${
        executing ? 'executing' : ''
      }`}
      data-id={id}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
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