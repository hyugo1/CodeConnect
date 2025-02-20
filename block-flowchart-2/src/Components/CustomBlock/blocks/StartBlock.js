// src/Components/CustomBlock/blocks/StartBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlay } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const StartBlock = ({ id, data, selected, executing }) => {
  return (
    <div
      className={`block-container start-block ${selected ? 'selected' : ''} ${
        executing ? 'executing' : ''
      }`}
      style={{ backgroundColor: '#d3f9d8' }}
    >
      <FaPlay style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%' }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
    </div>
  );
};

export default StartBlock;