// src/Components/CustomNode/nodes/DummyNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };

const DummyNode = ({ id, data, selected }) => {
  return (
    <div
      style={{
        padding: 10,
        border: '2px dashed #777',
        borderRadius: 5,
        position: 'relative',
        minWidth: 180,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      <FaQuestion style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
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
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '90%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
    </div>
  );
};

export default DummyNode;