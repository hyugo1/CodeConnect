import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaStop } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './block.css';

const EndBlock = ({ id, data, selected, executing }) => {
  return (
    <div
      className={`block-container end-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#f7d8d8' }}
    >
      <FaStop style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        style={{ left: '50%', top: '0px' }}
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another block"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
    </div>
  );
};

export default EndBlock;