// src/Components/CustomBlock/blocks/DummyBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const DummyBlock = ({ id, data, selected }) => {
  return (
    <>
      <style>
        {`
          .dummy-block {
            padding: 12px;
            border: 2px dashed #999;
            border-radius: 8px;
            background-color: #fafafa;
            color: black;
            min-width: 180px;
            text-align: center;
            font-weight: bold;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: background-color 0.3s ease, border-color 0.3s ease;
          }
          .dummy-block:hover {
            background-color: #f0f0f0;
            border-color: #777;
          }
          /* Note: The selected style will come from .block-container.selected */
        `}
      </style>
      <div className={`block-container dummy-block ${selected ? 'selected' : ''}`}>
        <FaQuestion style={{ marginBottom: 5 }} />
        <div>{data.label}</div>
        <Handle
          type="target"
          position={Position.Top}
          id={`target-${id}`}
          className="handle-target-circle"
          style={{ left: '50%', top: '0px', background: '#555' }}
          data-tooltip-id={`tooltip-${id}-target`}
          data-tooltip-content="Connect from previous block"
          isConnectable={true}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id={`source-${id}`}
          className="handle-source-square"
          style={{ left: '50%', top: '90%', background: '#555' }}
          data-tooltip-id={`tooltip-${id}-source`}
          data-tooltip-content="Connect to another block"
          isConnectable={true}
        />
        <Tooltip id={`tooltip-${id}-target`} place="top" />
        <Tooltip id={`tooltip-${id}-source`} place="top" />
      </div>
    </>
  );
};

export default DummyBlock;