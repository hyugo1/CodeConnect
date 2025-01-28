// src/Components/CustomNode/nodes/MoveNode.js

import React from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowsAltH,
} from 'react-icons/fa';
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

const MoveNode = ({ id, data, selected }) => {
  const { setNodes } = useReactFlow();

  const handleDistanceChange = (e) => {
    const newDistance = parseInt(e.target.value, 10) || 0;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              distance: newDistance,
            },
          };
        }
        return node;
      })
    );
  };

  const handleDirectionChange = (e) => {
    const newDirection = e.target.value;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              direction: newDirection,
            },
          };
        }
        return node;
      })
    );
  };

  let icon = null;
  switch (data.direction) {
    case 'up':
      icon = <FaArrowUp style={{ marginBottom: 5 }} />;
      break;
    case 'down':
      icon = <FaArrowDown style={{ marginBottom: 5 }} />;
      break;
    case 'left':
      icon = <FaArrowLeft style={{ marginBottom: 5 }} />;
      break;
    case 'right':
      icon = <FaArrowRight style={{ marginBottom: 5 }} />;
      break;
    default:
      icon = <FaArrowsAltH style={{ marginBottom: 5 }} />;
  }

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
        backgroundColor: '#d8f9f9',
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
        style={{ left: '50%', top: '95%', ...handleStyle }}
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <input
        type="number"
        placeholder="Enter distance"
        value={data.distance || ''}
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
        value={data.direction || ''}
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
      <div style={DownLineStyle}></div>
    </div>
  );
};

export default MoveNode;