// src/Components/CustomNode/blocks/PrintNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPrint } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const PrintNode = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleChange = (e) => {
    updateNodeData({ message: e.target.value });
  };

  return (
    <div
      className={`block-container print-block ${selected ? 'selected' : ''}`}
      style={{ backgroundColor: '#ffeeba' }}
    >
      <FaPrint style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '95%' }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <input
        type="text"
        placeholder="Enter message to print (e.g., 'x is {x}')"
        value={data.message || ''}
        onChange={handleChange}
        style={{
          width: '100%',
          marginTop: 10,
          padding: '5px',
          borderRadius: '3px',
          border: '1px solid #ccc',
          fontSize: '12px',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
};

export default PrintNode;