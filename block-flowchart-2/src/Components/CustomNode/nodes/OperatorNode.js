// src/Components/CustomNode/nodes/OperatorNode.js

import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  FaPlus,
  FaMinus,
  FaTimes,
  FaDivide,
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './node.css';

const handleStyle = { background: '#555' };
const DownLineStyle = {
  // position: 'absolute',
  // width: 3,
  // backgroundColor: '#555',
  // top: '100%',
  // left: '50%',
  // height: 50,
  // transform: 'translateX(-50%)',
  // zIndex: -1,
};
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
  const { setNodes } = useReactFlow();

  const handleOperand1Change = (e) => {
    const newOperand1 = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              operand1: newOperand1,
            },
          };
        }
        return node;
      })
    );
  };

  const handleOperand2Change = (e) => {
    const newOperand2 = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              operand2: newOperand2,
            },
          };
        }
        return node;
      })
    );
  };

  const handleResultVarChange = (e) => {
    const newResultVar = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              resultVar: newResultVar,
            },
          };
        }
        return node;
      })
    );
  };

  const handleOperatorChange = (e) => {
    const newOperator = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              operator: newOperator,
            },
          };
        }
        return node;
      })
    );
  };

  const { operator } = data;
  const icon = operatorIcons[operator] || <FaPlus style={{ marginBottom: 5 }} />;

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
        backgroundColor: '#f9d8f9',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      className={selected ? 'selected' : ''}
    >
      {icon}
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
        style={{ left: '50%', top: '97%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <select
        value={operator || ''}
        onChange={handleOperatorChange}
        style={{
          ...mathStyle,
          marginTop: 10,
          textAlign: 'center',
        }}
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
      <div style={DownLineStyle}></div>
    </div>
  );
};

export default OperatorNode;