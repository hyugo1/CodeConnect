// src/Components/blocks/JoinBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import './block.css';

const JoinBlock = ({ id, data, selected, executing }) => {
  return (
    <div className={`block-container join-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <div>Join</div>
      <Handle type="target" position={Position.Top} id={`target-${id}`} className="handle-target-circle" />
      <Handle type="source" position={Position.Bottom} id={`source-${id}`} className="handle-source-square" />
    </div>
  );
};

export default JoinBlock;