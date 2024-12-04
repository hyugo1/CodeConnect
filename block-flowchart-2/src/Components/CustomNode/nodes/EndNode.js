// src/Components/CustomNode/nodes/EndNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaStopCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const handleStyle = { background: '#555' };

const EndNode = ({ id, data, selected }) => {
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
        backgroundColor: '#f8d7da',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaStopCircle style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        style={{ left: '50%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from the last node inside the loop"
        isConnectable={true}
      />
      {/* No source handles as it's an end node */}
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndNode;