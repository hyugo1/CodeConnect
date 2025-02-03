// src/Components/CustomNode/nodes/EndNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaStop } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const EndNode = ({ id, data, selected }) => {
  return (
    <div className={`node-container end-node ${selected ? 'selected' : ''}`}
         style={{ backgroundColor: '#f7d8d8' }}  /* Removed minWidth override */
    >
      <FaStop style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndNode;