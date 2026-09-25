// src/Components/CustomBlock/blocks/JoinBlock.js

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HelpModal from '../../Modal/HelpModal';
import './block.css';

const JoinBlock = ({ id, data, selected, executing }) => {
  const [showHelp, setShowHelp] = useState(false);

  const helpText = `
  • This block joins two branches into one common flow.
  • Connect the outputs of both the True and False branches to this block.
  • Ensure that all branches are connected, so the program flow is complete.
  `;

  return (
    <div className={`block-container join-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <div className="block-header">
        <CallMergeIcon className="block-icon" />
        <span>Join</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowHelp(true);
          }}
          className="help-button"
          title="How to use this block"
        >
          <HelpOutlineIcon />
        </button>
      </div>
      <HelpModal
        visible={showHelp}
        helpText={helpText}
        title="Join Block Help"
        onClose={() => setShowHelp(false)}
      />
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from branches"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to next block"
        isConnectable={true}
      />
    </div>
  );
};

export default JoinBlock;