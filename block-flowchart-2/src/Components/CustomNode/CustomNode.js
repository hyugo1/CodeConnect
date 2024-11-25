// src/Components/CustomNode/CustomNode.js

import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import {
  FaPlay,
  FaStop,
  FaQuestion,
  FaSync,
  FaCheck,
  FaPrint,
  FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowsAltH, FaPlus, FaMinus, FaTimes, FaDivide
} from 'react-icons/fa';
import './CustomNode.css';

const handleStyle = { background: '#555' };

const lineStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  zIndex: -1,
};

const iconStyle = { marginRight: 5 };

const CustomNode = ({ id, data, selected }) => {
  const { label, nodeType, onChange, action, message, distance, direction, operand1,operand2,resultVar} = data;

  const [currentAction, setCurrentAction] = useState(action || '');
  const [currentMessage, setCurrentMessage] = useState(message || '');
  const [currentDistance, setCurrentDistance] = useState(distance || '');
  const [currentDirection, setCurrentDirection] = useState(direction || '');

  const [currentOperand1, setCurrentOperand1] = useState(operand1 || '');
  const [currentOperand2, setCurrentOperand2] = useState(operand2 || '');
  const [currentResultVar, setCurrentResultVar] = useState(resultVar || '');


  useEffect(() => {
    setCurrentAction(action || '');
    setCurrentMessage(message || '');
    setCurrentDistance(distance || '');
    setCurrentDirection(direction || '');
    setCurrentOperand1(operand1 || '');
    setCurrentOperand2(operand2 || '');
    setCurrentResultVar(resultVar || '');
  }, [action, message, distance, direction, operand1, operand2, resultVar]);

  const handleActionChange = (e) => {
    const newAction = e.target.value;
    setCurrentAction(newAction);
    onChange(id, label, newAction, currentMessage, currentDistance);
  };

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setCurrentMessage(newMessage);
    console.log('handleMessageChange:', { id, newMessage });
    onChange(id, label, currentAction, newMessage, currentDistance);
  };

  const handleDistanceChange = (e) => {
    const newDistance = e.target.value;
    if (!isNaN(newDistance)) {
      setCurrentDistance(newDistance);
      onChange(id, label, currentAction, currentMessage, newDistance, currentDirection);
    }
  };

  const handleDirectionChange = (e) => {
    const newDirection = e.target.value;
    setCurrentDirection(newDirection);
    onChange(id, label, currentAction, currentMessage, currentDistance, newDirection);
  };

  const handleOperand1Change = (e) => {
    const newOperand1 = e.target.value;
    setCurrentOperand1(newOperand1);
    onChange(id, label, action, message, distance, direction, newOperand1, currentOperand2, currentResultVar);
  };

  const handleOperand2Change = (e) => {
    const newOperand2 = e.target.value;
    setCurrentOperand2(newOperand2);
    onChange(id, label, action, message, distance, direction, currentOperand1, newOperand2, currentResultVar);
  };

  const handleResultVarChange = (e) => {
    const newResultVar = e.target.value;
    setCurrentResultVar(newResultVar);
    onChange(id, label, action, message, distance, direction, currentOperand1, currentOperand2, newResultVar);
  };

  console.log('CustomNode id:', id);

  // Define styles and icons based on nodeType
  let nodeStyle = {
    padding: 10,
    border: '2px solid #777',
    borderRadius: 5,
    position: 'relative',
    minWidth: 180, // Increased width for better layout
    textAlign: 'center',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  };
  let icon = null;
  let handles = null;
  let lines = null;

  switch (nodeType) {
    case 'start':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d3f9d8' };
      icon = <FaPlay style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <div
          style={{
            ...lineStyle,
            top: '100%',
            left: '50%',
            height: 50,
            transform: 'translateX(-50%)',
          }}
        ></div>
      );
      break;
    case 'end':
      nodeStyle = { ...nodeStyle, backgroundColor: '#f9d8d8' };
      icon = <FaStop style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Tooltip id={`tooltip-${id}-target`} place="top" />
        </>
      );
      lines = null;
      break;
    case 'if':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8d8f9' };
      icon = <FaQuestion style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          {/* Yes branch */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={`yes-${id}`}
            style={{ left: '25%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-yes`}
            data-tooltip-content="True Branch"
            isConnectable={true}
          />
          {/* No branch */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={`no-${id}`}
            style={{ left: '75%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-no`}
            data-tooltip-content="False Branch"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-yes`} place="top" />
          <Tooltip id={`tooltip-${id}-no`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Yes branch line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '25%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
          {/* No branch line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '75%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'while':
      nodeStyle = { ...nodeStyle, backgroundColor: '#f9f7d8' };
      icon = <FaSync style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          {/* Loop back branch */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={`loop-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-loop`}
            data-tooltip-content="Loop Back"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-loop`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Loop back line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'whileChecker':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8d8f9' };
      icon = <FaCheck style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          {/* Loop back branch */}
          <Handle
            type="source"
            position={Position.Bottom}
            id={`loop-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-loop`}
            data-tooltip-content="Loop Ends"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-loop`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Loop back line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'print': // New Print Block
      nodeStyle = { ...nodeStyle, backgroundColor: '#ffeeba' };
      icon = <FaPrint style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;

      case 'moveUp':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8f9f9' };
      icon = <FaArrowUp style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'moveDown':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8f9f9' };
      icon = <FaArrowDown style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'moveLeft':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8f9f9' };
      icon = <FaArrowLeft style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'moveRight':
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8f9f9' };
      icon = <FaArrowRight style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
    case 'move': // Generic move block
      nodeStyle = { ...nodeStyle, backgroundColor: '#d8f9f9' };
      icon = <FaArrowsAltH style={iconStyle} />;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;

      case 'add':
        nodeStyle = { ...nodeStyle, backgroundColor: '#f9d8f9' };
        icon = <FaPlus style={iconStyle} />;
        handles = (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id={`target-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-target`}
              data-tooltip-content="Connect from another node"
              isConnectable={true}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id={`source-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-source`}
              data-tooltip-content="Connect to another node"
              isConnectable={true}
            />
            {/* Tooltips */}
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div
              style={{
                ...lineStyle,
                top: '100%',
                left: '50%',
                height: 50,
                transform: 'translateX(-50%)',
              }}
            ></div>
          </>
        );
        break;
      case 'subtract':
        nodeStyle = { ...nodeStyle, backgroundColor: '#f9d8f9' };
        icon = <FaMinus style={iconStyle} />;
        handles = (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id={`target-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-target`}
              data-tooltip-content="Connect from another node"
              isConnectable={true}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id={`source-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-source`}
              data-tooltip-content="Connect to another node"
              isConnectable={true}
            />
            {/* Tooltips */}
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div
              style={{
                ...lineStyle,
                top: '100%',
                left: '50%',
                height: 50,
                transform: 'translateX(-50%)',
              }}
            ></div>
          </>
        );
        break;
      case 'multiply':
        nodeStyle = { ...nodeStyle, backgroundColor: '#f9d8f9' };
        icon = <FaTimes style={iconStyle} />;
        handles = (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id={`target-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-target`}
              data-tooltip-content="Connect from another node"
              isConnectable={true}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id={`source-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-source`}
              data-tooltip-content="Connect to another node"
              isConnectable={true}
            />
            {/* Tooltips */}
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div
              style={{
                ...lineStyle,
                top: '100%',
                left: '50%',
                height: 50,
                transform: 'translateX(-50%)',
              }}
            ></div>
          </>
        );
        break;
      case 'divide':
        nodeStyle = { ...nodeStyle, backgroundColor: '#f9d8f9' };
        icon = <FaDivide style={iconStyle} />;
        handles = (
          <>
            <Handle
              type="target"
              position={Position.Top}
              id={`target-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-target`}
              data-tooltip-content="Connect from another node"
              isConnectable={true}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id={`source-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-source`}
              data-tooltip-content="Connect to another node"
              isConnectable={true}
            />
            {/* Tooltips */}
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div
              style={{
                ...lineStyle,
                top: '100%',
                left: '50%',
                height: 50,
                transform: 'translateX(-50%)',
              }}
            ></div>
          </>
        );
        break;
    default:
      nodeStyle = { ...nodeStyle, backgroundColor: '#fff' };
      icon = null;
      handles = (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id={`target-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-target`}
            data-tooltip-content="Connect from another node"
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id={`source-${id}`}
            style={{ left: '50%', ...handleStyle }}
            data-tooltip-id={`tooltip-${id}-source`}
            data-tooltip-content="Connect to another node"
            isConnectable={true}
          />
          {/* Tooltips */}
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          {/* Downward line */}
          <div
            style={{
              ...lineStyle,
              top: '100%',
              left: '50%',
              height: 50,
              transform: 'translateX(-50%)',
            }}
          ></div>
        </>
      );
      break;
  }

  return (
    <div style={nodeStyle} className={selected ? 'selected' : ''}>
      {icon}
      <div>{label}</div>
      {/* Action Input */}
      {(nodeType === 'action' || nodeType === 'if' || nodeType === 'while') && (
        <textarea
          placeholder="Enter action or condition here"
          value={currentAction}
          onChange={handleActionChange}
          style={{
            width: '100%',
            marginTop: 10,
            resize: 'vertical',
            minHeight: '50px',
            padding: '5px',
            borderRadius: '3px',
            border: '1px solid #ccc',
            fontSize: '12px',
            boxSizing: 'border-box',
          }}
        />
      )}
      {/* Print Message Input */}
      {nodeType === 'print' && (
        <input
          type="text"
          placeholder="Enter message to print"
          value={currentMessage}
          onChange={handleMessageChange}
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
      )}
      {nodeType === 'move' && (
  <>
    <input
      type="number"
      placeholder="Enter distance"
      value={currentDistance}
      onChange={handleDistanceChange}
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
    <select
      value={currentDirection}
      onChange={handleDirectionChange}
      style={{
        width: '100%',
        marginTop: 10,
        padding: '5px',
        borderRadius: '3px',
        border: '1px solid #ccc',
        fontSize: '12px',
        boxSizing: 'border-box',
      }}
    >
      <option value="">Select Direction</option>
      <option value="up">Up</option>
      <option value="down">Down</option>
      <option value="left">Left</option>
      <option value="right">Right</option>
    </select>
  </>
)}
      {/* Math Operator Inputs */}
      {['add', 'subtract', 'multiply', 'divide'].includes(nodeType) && (
        <>
          <input
            type="text"
            placeholder="Operand 1"
            value={currentOperand1}
            onChange={handleOperand1Change}
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
          <input
            type="text"
            placeholder="Operand 2"
            value={currentOperand2}
            onChange={handleOperand2Change}
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
          <input
            type="text"
            placeholder="Result Variable"
            value={currentResultVar}
            onChange={handleResultVarChange}
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
        </>
      )}
      {handles}
      {lines}
    </div>
  );
};


export default CustomNode;