// src/Components/blocks/EndBlock.js

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaStop} from 'react-icons/fa';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const EndBlock = ({ id, data, selected, executing }) => {
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
  • This block marks the end of your program.
  • When the program reaches this block, it stops running.
  • Always place it at the very end to signal that there are no more steps.
  `;

  return (
    <div className={`block-container end-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button onClick={() => setShowHelp(true)} className="help-button" title="How to use this block">
        <HelpOutlineIcon />
      </button>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="End Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaStop className="block-icon" />
      <div>{data.label || 'End'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndBlock;