// src/Components/CustomNode/nodes/WhileEndNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaSync } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };

const WhileEndNode = ({ id, data, selected }) => {
  return (
    <div
      style={{
        padding: 10,
        border: '2px solid #777',
        borderRadius: 5,
        position: 'relative',
        minWidth: 180,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#f9f7d8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaSync style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      {/* Entrance Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px', ...handleStyle }}
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
        style={{ left: '100%', top: '50%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Connect back to While Start for looping"
        isConnectable={true}
      />
      {/* Exit Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`exit-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-exit`}
        data-tooltip-content="Connect to next node after loop"
        isConnectable={true}
      />

      {/* Tooltips */}
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
      <Tooltip id={`tooltip-${id}-exit`} place="top" />
    </div>
  );
};

export default WhileEndNode;