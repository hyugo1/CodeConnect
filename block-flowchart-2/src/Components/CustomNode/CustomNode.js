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
  FaPrint, // Added FaPrint
} from 'react-icons/fa'; // Removed FaCog

const handleStyle = { background: '#555' };

const lineStyle = {
  position: 'absolute',
  width: 3,
  backgroundColor: '#555',
  zIndex: -1,
};

const iconStyle = { marginRight: 5 };

const CustomNode = ({ id, data, selected }) => {
  const { label, nodeType, onChange, action, message } = data;

  const [currentAction, setCurrentAction] = useState(action || '');
  const [currentMessage, setCurrentMessage] = useState(message || '');


  useEffect(() => {
    setCurrentAction(action || '');
    setCurrentMessage(message || '');
  }, [action, message]);

  const handleActionChange = (e) => {
    const newAction = e.target.value;
    setCurrentAction(newAction);
    onChange(id, label, newAction, currentMessage);
  };

  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setCurrentMessage(newMessage);
    console.log('handleMessageChange:', { id, newMessage });
    onChange(id, label, currentAction, newMessage);
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
      {handles}
      {lines}
    </div>
  );
};

export default CustomNode;