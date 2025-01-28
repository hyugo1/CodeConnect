// src/Components/CustomNode/nodes/EndNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaStopCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };
const DownLineStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  top: '100%',
  left: '50%',
  height: 50,
  transform: 'translateX(-50%)',
  zIndex: -1,
};

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
      className={`end-node ${selected ? 'selected' : ''}`}
    >
      <FaStopCircle style={{ marginBottom: 5, }} />
      {data.label}
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{
          left: '50%',
          top: '0px',
          transform: 'translate(-50%, -50%)',
          ...handleStyle
        }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      {/* No source handles as it's an end node */}
      {/* Tooltips */}
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndNode;