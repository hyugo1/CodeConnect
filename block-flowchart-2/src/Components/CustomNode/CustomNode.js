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
  // FaCheck,
  FaPrint,
  FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowsAltH, FaPlus, FaMinus, FaTimes, FaDivide, FaPenFancy, FaPlusCircle
} from 'react-icons/fa';
import './CustomNode.css';

const handleStyle = { background: '#555' };

const lineStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  zIndex: -1,
};

const DownLineStyle = {...lineStyle,
  top: '100%',
  left: '50%',
  height: 50,
  transform: 'translateX(-50%)',
};

const inputStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const bottomLeftStyle = {
  ...lineStyle,
  top: '100%',
  left: '25%',
  height: 50,
  transform: 'translateX(-50%)',
};

const bottomRightStyle = {
  ...lineStyle,
  top: '100%',
  left: '75%',
  height: 50,
  transform: 'translateX(-50%)',
};

const textStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
}

const mathStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
}

const iconStyle = { marginRight: 5 };

const CustomNode = ({ id, data, selected }) => {
  const { label, nodeType, onChange, action, message, distance, direction, operand1,operand2,resultVar, varName, varValue, leftOperand, operator, rightOperand,} = data;

  const [currentAction, setCurrentAction] = useState(action || '');
  const [currentMessage, setCurrentMessage] = useState(message || '');
  const [currentDistance, setCurrentDistance] = useState(distance || '');
  const [currentDirection, setCurrentDirection] = useState(direction || '');

  const [currentOperand1, setCurrentOperand1] = useState(operand1 || '');
  const [currentOperand2, setCurrentOperand2] = useState(operand2 || '');
  const [currentResultVar, setCurrentResultVar] = useState(resultVar || '');

  const [currentVarName, setCurrentVarName] = useState(varName || '');
  const [currentVarValue, setCurrentVarValue] = useState(varValue || '');

  const [currentLeftOperand, setCurrentLeftOperand] = useState(leftOperand || '');
  const [currentOperator, setCurrentOperator] = useState(operator || '');
  const [currentRightOperand, setCurrentRightOperand] = useState(rightOperand || '');


  useEffect(() => {
    setCurrentAction(action || '');
    setCurrentMessage(message || '');
    setCurrentDistance(distance || '');
    setCurrentDirection(direction || '');
    setCurrentOperand1(operand1 || '');
    setCurrentOperand2(operand2 || '');
    setCurrentResultVar(resultVar || '');
    setCurrentVarName(varName || '');
    setCurrentVarValue(varValue || '');
    setCurrentLeftOperand(leftOperand || '');
    setCurrentOperator(operator || '');
    setCurrentRightOperand(rightOperand || '');
  }, [action, message, distance, direction, operand1, operand2, resultVar, varName, varValue, leftOperand, operator, rightOperand]);

  const handleActionChange = (e) => {
    const newAction = e.target.value;
    setCurrentAction(newAction);
    onChange(id, label, newAction, currentMessage, currentDistance);
  };

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setCurrentMessage(newMessage);
    onChange(
      id, label, currentAction, newMessage, currentDistance, currentDirection, currentOperand1, currentOperand2, currentResultVar, currentVarName, currentVarValue, currentLeftOperand, currentOperator, currentRightOperand
    );
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

  const handleVarNameChange = (e) => {
    const newVarName = e.target.value;
    setCurrentVarName(newVarName);
    onChange(id, label, action, message, distance, direction, operand1, operand2, resultVar, newVarName, currentVarValue
    );
  };

  const handleVarValueChange = (e) => {
    const newVarValue = e.target.value;
    setCurrentVarValue(newVarValue);
    onChange(id, label, action, message, distance, direction, operand1, operand2, resultVar, currentVarName, newVarValue
    );
  };

  const handleLeftOperandChange = (e) => {
    const newLeftOperand = e.target.value;
    setCurrentLeftOperand(newLeftOperand);
    onChange(id, label, action, message, distance, direction, operand1, operand2, resultVar, varName, varValue, newLeftOperand, currentOperator, currentRightOperand
    );
  };

  const handleOperatorChange = (e) => {
    const newOperator = e.target.value;
    setCurrentOperator(newOperator);
    onChange(id, label, currentAction, currentMessage, currentDistance, currentDirection, currentOperand1,currentOperand2, currentResultVar, currentVarName, currentVarValue, currentLeftOperand, newOperator, currentRightOperand
    );
  };

  const handleRightOperandChange = (e) => {
    const newRightOperand = e.target.value;
    setCurrentRightOperand(newRightOperand);
    onChange(id, label, action, message, distance, direction, operand1, operand2, resultVar, varName, varValue, currentLeftOperand, currentOperator, newRightOperand
    );
  };

  console.log('CustomNode id:', id);

  // Define styles and icons based on nodeType
  let nodeStyle = {
    padding: 10,
    border: '2px solid #777',
    borderRadius: 5,
    position: 'relative',
    minWidth: 180,
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
        <div style={DownLineStyle}></div>
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
            style={bottomLeftStyle}
          ></div>
          {/* No branch line */}
          <div
            style={bottomRightStyle}
          ></div>
        </>
      );
      break;

      case 'whileStart':
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
            <Handle
              type="source"
              position={Position.Bottom}
              id={`source-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-source`}
              data-tooltip-content="Connect to the first node inside the loop"
              isConnectable={true}
            />
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div style={DownLineStyle}></div>
          </>
        );
        break;
  
      case 'whileEnd':
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
              data-tooltip-content="Connect from the last node inside the loop"
              isConnectable={true}
            />
            <Handle
              type="source"
              position={Position.Bottom}
              id={`source-${id}`}
              style={{ left: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-source`}
              data-tooltip-content="Connect to the next node after the loop"
              isConnectable={true}
            />
            {/* Loop back handle */}
            <Handle
              type="source"
              position={Position.Right}
              id={`loopBack-${id}`}
              style={{ top: '50%', ...handleStyle }}
              data-tooltip-id={`tooltip-${id}-loopBack`}
              data-tooltip-content="Loop back to While Start"
              isConnectable={true}
            />
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
            <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div style={DownLineStyle}></div>
            {/* Loop back line */}
            <div
              style={{
                ...lineStyle,
                top: '50%',
                right: '-50px',
                width: 50,
                height: 3,
                transform: 'translateY(-50%)',
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
          <div style={DownLineStyle}></div>
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
          <div style={DownLineStyle}></div>
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
          <div style={DownLineStyle}></div>
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
          <div style={DownLineStyle}></div>
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
          <div style={DownLineStyle}></div>
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
          <div style={DownLineStyle}></div>
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
            <div style={DownLineStyle}></div>
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
            <div style={DownLineStyle} ></div>
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
            <div style={DownLineStyle}></div>
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
            <div style={DownLineStyle}></div>
          </>
        );
        break;
    case 'setVariable':
      nodeStyle = { ...nodeStyle, backgroundColor: '#e0e0e0' };
      icon = <FaPenFancy style={iconStyle} />;
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
          <Tooltip id={`tooltip-${id}-target`} place="top" />
          <Tooltip id={`tooltip-${id}-source`} place="top" />
        </>
      );
      lines = (
        <>
          <div style={DownLineStyle}></div>
        </>
      );
      break;
      case 'incrementDecrement':
        nodeStyle = { ...nodeStyle, backgroundColor: '#e0ffe0' };
        icon = <FaPlusCircle style={iconStyle} />;
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
            <Tooltip id={`tooltip-${id}-target`} place="top" />
            <Tooltip id={`tooltip-${id}-source`} place="top" />
          </>
        );
        lines = (
          <>
            {/* Downward line */}
            <div style={DownLineStyle}></div>
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
          <div style={DownLineStyle}></div>
        </>
      );
      break;
  }

  return (
    <div style={nodeStyle} className={selected ? 'selected' : ''}>
      {icon}
      <div>{label}</div>
      {/* Action Input */}
      {(nodeType === 'action') && (
        <textarea
          placeholder="Enter action here"
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
        {nodeType === 'if' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
              <input
                type="text"
                placeholder="Left Operand"
                value={currentLeftOperand}
                onChange={handleLeftOperandChange}
                style={{
                  flex: 1,
                  padding: '5px',
                  borderRadius: '3px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                  marginRight: '5px',
                }}
              />
             <select
              value={currentOperator}
              onChange={handleOperatorChange}
              style={{
                padding: '5px',
                borderRadius: '3px',
                border: '1px solid #ccc',
                fontSize: '12px',
                marginRight: '5px',
              }}
            >
              <option value="">Op</option>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="==">==</option>
              <option value="!=">!=</option>
            </select>
              <input
                type="text"
                placeholder="Right Operand"
                value={currentRightOperand}
                onChange={handleRightOperandChange}
                style={{
                  flex: 1,
                  padding: '5px',
                  borderRadius: '3px',
                  border: '1px solid #ccc',
                  fontSize: '12px',
                }}
              />
            </div>
          </>
        )}
        {nodeType === 'whileEnd' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
            <input
              type="text"
              placeholder="Left Operand"
              value={currentLeftOperand}
              onChange={handleLeftOperandChange}
              style={{
                flex: 1,
                padding: '5px',
                borderRadius: '3px',
                border: '1px solid #ccc',
                fontSize: '12px',
                marginRight: '5px',
              }}
            />
            <select
              value={currentOperator}
              onChange={handleOperatorChange}
              style={{
                padding: '5px',
                borderRadius: '3px',
                border: '1px solid #ccc',
                fontSize: '12px',
                marginRight: '5px',
              }}
            >
              <option value="">Op</option>
              <option value="<">&lt;</option>
              <option value=">">&gt;</option>
              <option value="==">==</option>
              <option value="!=">!=</option>
            </select>
            <input
              type="text"
              placeholder="Right Operand"
              value={currentRightOperand}
              onChange={handleRightOperandChange}
              style={{
                flex: 1,
                padding: '5px',
                borderRadius: '3px',
                border: '1px solid #ccc',
                fontSize: '12px',
              }}
            />
          </div>
        </>
      )}
        {/* {nodeType === 'whileStart' && (
          <>
            <label style={{ marginTop: 10, fontSize: '12px', fontWeight: 'bold' }}>Condition:</label>
            <textarea
              placeholder="Enter condition here (e.g., X > 10)"
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
          </>
        )} */}
      {/* Print Message Input */}
      {nodeType === 'print' && (
        <input
          type="text"
          placeholder="Enter message to print"
          value={currentMessage}
          onChange={handleMessageChange}
          style={textStyle}
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
            style={mathStyle}
          />
          <input
            type="text"
            placeholder="Operand 2"
            value={currentOperand2}
            onChange={handleOperand2Change}
            style={mathStyle}
          />
          <input
            type="text"
            placeholder="Result Variable"
            value={currentResultVar}
            onChange={handleResultVarChange}
            style={mathStyle}
          />
        </>
      )}
      {nodeType === 'setVariable' && (
      <>
        <input
          type="text"
          placeholder="Variable Name"
          value={currentVarName}
          onChange={handleVarNameChange}
          style={textStyle}
        />
        <input
          type="text"
          placeholder="Value"
          value={currentVarValue}
          onChange={handleVarValueChange}
          style={textStyle}
        />
      </>
    )}
        {nodeType === 'incrementDecrement' && (
      <>
        <input
          type="text"
          placeholder="Variable Name"
          value={currentVarName}
          onChange={handleVarNameChange}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Increment/Decrement Value"
          value={currentVarValue}
          onChange={handleVarValueChange}
          style={inputStyle}
        />
      </>
    )}
      {handles}
      {lines}
    </div>
  );
};


export default CustomNode;