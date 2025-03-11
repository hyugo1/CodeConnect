import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowsAltH, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const inputStyle = {
  width: '100%',
  marginTop: 10,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  fontSize: '16px',
  boxSizing: 'border-box',
};

const MoveBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• Enter the distance to move.
• Select a direction (up, down, left, right).`;

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
    <div
      className={`block-container move-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#d8f9f9', position: 'relative' }}
    >
      <button
        onClick={() => setShowHelp(true)}
        style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          color: '#555',
        }}
        title="How to use this block"
      >
        <FaQuestion />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Move Block Help"
        onClose={() => setShowHelp(false)}
      />
      {icon}
      <div>{data.label || 'Move Character'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <input
        type="number"
        placeholder="Distance to move"
        value={data.distance || ''}
        onChange={handleDistanceChange}
        style={inputStyle}
      />
      <select value={data.direction || ''} onChange={handleDirectionChange} style={inputStyle}>
        <option value="">Select Direction</option>
        <option value="up">Up</option>
        <option value="down">Down</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>
    </div>
  );
};

export default MoveBlock;