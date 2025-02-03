// src/Components/CustomNode/nodes/WhileEndNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaSync } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const WhileEndNode = ({ id, data, selected }) => {
  return (
    <div className={`node-container while-end-node ${selected ? 'selected' : ''}`}
         style={{ backgroundColor: '#f9f7d8' }}>
      <FaSync style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      {/* Entrance Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from loop body"
        isConnectable={true}
      />
      {/* Loop Back Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`loopBack-${id}`}
        className="handle-source-square"
        style={{ left: '100%', top: '50%' }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Connect back to While Start for looping"
        isConnectable={true}
      />
      {/* Exit Handle – updated to be on the left */}
      <Handle
        type="source"
        position={Position.Bottom}
        id={`exit-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%' }}
        data-tooltip-id={`tooltip-${id}-exit`}
        data-tooltip-content="Connect to next node after while loop"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
      <Tooltip id={`tooltip-${id}-exit`} place="top" />
    </div>
  );
};

export default WhileEndNode;