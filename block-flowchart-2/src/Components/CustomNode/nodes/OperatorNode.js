// src/Components/CustomNode/nodes/OperatorNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlus, FaMinus, FaTimes, FaDivide } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './node.css';

const mathStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const operatorIcons = {
  add: <FaPlus style={{ marginBottom: 5 }} />,
  subtract: <FaMinus style={{ marginBottom: 5 }} />,
  multiply: <FaTimes style={{ marginBottom: 5 }} />,
  divide: <FaDivide style={{ marginBottom: 5 }} />,
};

const OperatorNode = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleOperand1Change = (e) => {
    updateNodeData({ operand1: e.target.value });
  };

  const handleOperand2Change = (e) => {
    updateNodeData({ operand2: e.target.value });
  };

  const handleResultVarChange = (e) => {
    updateNodeData({ resultVar: e.target.value });
  };

  const handleOperatorChange = (e) => {
    updateNodeData({ operator: e.target.value });
  };

  const { operator } = data;
  const icon = operatorIcons[operator] || <FaPlus style={{ marginBottom: 5 }} />;

  return (
    <div className={`node-container operator-node ${selected ? 'selected' : ''}`}
         style={{ backgroundColor: '#f9d8f9' }}>
      {icon}
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
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        style={{ left: '50%', top: '97%' }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <select
        value={operator || ''}
        onChange={handleOperatorChange}
        style={{ ...mathStyle, marginTop: 10, textAlign: 'center' }}
      >
        <option value="">Select Operator</option>
        <option value="add">Add (+)</option>
        <option value="subtract">Subtract (-)</option>
        <option value="multiply">Multiply (×)</option>
        <option value="divide">Divide (÷)</option>
      </select>
      <input
        type="text"
        placeholder="Operand 1"
        value={data.operand1 || ''}
        onChange={handleOperand1Change}
        style={mathStyle}
      />
      <input
        type="text"
        placeholder="Operand 2"
        value={data.operand2 || ''}
        onChange={handleOperand2Change}
        style={mathStyle}
      />
      <input
        type="text"
        placeholder="Result Variable"
        value={data.resultVar || ''}
        onChange={handleResultVarChange}
        style={mathStyle}
      />
    </div>
  );
};

export default OperatorNode;