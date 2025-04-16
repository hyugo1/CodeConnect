import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Modal/HelpModal';
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

const RotateBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
  • This block rotates your character on the screen.
  • Enter a number to define the degrees to rotate.
  • Then, choose a direction from the dropdown.
  `;
  
  const handleDegreesChange = (e) => {
    const newDegrees = parseInt(e.target.value, 10) || 0;
    updateNodeData({ degrees: newDegrees });
  };

  const handleDirectionChange = (e) => {
    updateNodeData({ rotateDirection: e.target.value });
  };

  let icon;
  switch (data.rotateDirection) {
    case 'left':
      icon = <Rotate90DegreesCcwIcon className="block-icon" />;
      break;
    case 'right':
      icon = <Rotate90DegreesCwIcon className="block-icon" />;
      break;
    default:
      icon = <ThreeSixtyIcon className="block-icon" />;
  }

  return (
    <div className={`block-container rotate-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button onClick={() => setShowHelp(true)} className="help-button" title="How to use this block">
        <HelpOutlineIcon />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Rotate Block Help"
        onClose={() => setShowHelp(false)}
      />
      {icon}
      <div>{data.label || 'Rotate Character'}</div>
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
        placeholder="Degrees to Rotate"
        value={data.degrees || ''}
        onChange={handleDegreesChange}
        style={inputStyle}
      />
      <select
        value={data.rotateDirection || ''}
        onChange={handleDirectionChange}
        style={inputStyle}
      >
        <option value="">Select Direction</option>
        <option value="left">Rotate Left</option>
        <option value="right">Rotate Right</option>
      </select>
    </div>
  );
};

export default RotateBlock;