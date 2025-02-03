// src/Components/CustomNode/nodes/DummyNode.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const DummyNode = ({ id, data, selected }) => {
  return (
    <>
      {/* Inline Style Block */}
      <style>
        {`
          .dummy-node {
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

          .dummy-node:hover {
            background-color: #f0f0f0;
            border-color: #777;
          }

          /* You can include additional shared or scoped styles here. */
          .handle-target-circle {
            /* Example handle styling */
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }

          .handle-source-square {
            /* Example handle styling */
            width: 10px;
            height: 10px;
          }

          /* If there's a selected state styling, you can handle that too */
          .dummy-node.selected {
            border-color: #007bff;
            background-color: #e7f0ff;
          }
        `}
      </style>

      <div className={`dummy-node ${selected ? 'selected' : ''}`}>
        <FaQuestion style={{ marginBottom: 5 }} />
        <div>{data.label}</div>

        {/* Target (Entrance) Handle */}
        <Handle
          type="target"
          position={Position.Top}
          id={`target-${id}`}
          className="handle-target-circle"
          style={{ left: '50%', top: '0px', background: '#555' }}
          data-tooltip-id={`tooltip-${id}-target`}
          data-tooltip-content="Connect from previous node"
          isConnectable={true}
        />

        {/* Source (Exit) Handle */}
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

        {/* Tooltip elements */}
        <Tooltip id={`tooltip-${id}-target`} place="top" />
        <Tooltip id={`tooltip-${id}-source`} place="top" />
      </div>
    </>
  );
};

export default DummyNode;