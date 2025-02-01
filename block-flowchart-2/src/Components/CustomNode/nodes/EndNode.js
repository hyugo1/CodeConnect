// src/Components/CustomNode/nodes/EndNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaStop } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };

const EndNode = ({ id, data, selected }) => {
  return (
    <div
      style={{
        padding: 10,
        border: '2px solid #777',
        borderRadius: 5,
        position: 'relative',
        minWidth: 100,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#f7d8d8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaStop style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      {/* No outgoing handles */}
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      {/* Tooltips */}
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndNode;