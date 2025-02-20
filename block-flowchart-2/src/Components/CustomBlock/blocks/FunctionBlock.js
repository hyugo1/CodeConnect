// src/Components/CustomBlock/blocks/FunctionBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const functionStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const FunctionBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleResultVarChange = (e) => {
    updateNodeData({ resultVar: e.target.value });
  };

  const handleExpressionChange = (e) => {
    updateNodeData({ expression: e.target.value });
  };

  return (
    <div
      className={`block-container function-block ${selected ? 'selected' : ''} ${
        executing ? 'executing' : ''
      }`}
      style={{ backgroundColor: '#f0e68c' }}
    >
      <div style={{ fontWeight: 'bold' }}>{data.label || 'Function'}</div>
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
        placeholder="Result Variable (e.g., a)"
        value={data.resultVar || ''}
        onChange={handleResultVarChange}
        style={functionStyle}
      />
      <input
        type="text"
        placeholder="Expression (e.g., b*c*d*e)"
        value={data.expression || ''}
        onChange={handleExpressionChange}
        style={functionStyle}
      />
    </div>
  );
};

export default FunctionBlock;