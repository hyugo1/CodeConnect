// src/Components/CustomNode/nodes/StartNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlay } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const StartNode = ({ id, data, selected }) => {
  return (
    <div className={`node-container start-node ${selected ? 'selected' : ''}`}
         style={{ backgroundColor: '#d3f9d8' }}>
      <FaPlay style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%' }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
    </div>
  );
};

export default StartNode;