// src/Components/CustomNode/nodes/MoveNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowsAltH,
} from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './node.css';

const inputStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const MoveNode = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleDistanceChange = (e) => {
    const newDistance = parseInt(e.target.value, 10) || 0;
    updateNodeData({ distance: newDistance });
  };

  const handleDirectionChange = (e) => {
    updateNodeData({ direction: e.target.value });
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
    <div className={`node-container move-node ${selected ? 'selected' : ''}`}
         style={{ backgroundColor: '#d8f9f9' }}>
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
        style={{ left: '50%', top: '95%' }}
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
        style={inputStyle}
      />
      <select
        value={data.direction || ''}
        onChange={handleDirectionChange}
        style={inputStyle}
      >
        <option value="">Select Direction</option>
        <option value="up">Up</option>
        <option value="down">Down</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </div>
  );
};

export default MoveNode;