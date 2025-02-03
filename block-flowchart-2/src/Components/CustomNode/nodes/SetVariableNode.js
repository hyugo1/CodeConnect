// src/Components/CustomNode/nodes/SetVariableNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPenFancy } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './node.css';

const SetVariableNode = ({ id, data, selected }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleVarNameChange = (e) => {
    updateNodeData({ varName: e.target.value });
  };

  const handleVarValueChange = (e) => {
    updateNodeData({ varValue: e.target.value });
  };

  return (
    <div className={`node-container ${selected ? 'selected' : ''}`}>
      <FaPenFancy style={{ marginBottom: 5 }} />
      <div>{data.label}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from another node"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`source-${id}`}
        className="handle-source-square"
        data-tooltip-id={`tooltip-${id}-source`}
        data-tooltip-content="Connect to another node"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-source`} place="top" />
      <input
        type="text"
        placeholder="Variable Name"
        value={data.varName || ''}
        onChange={handleVarNameChange}
        className="node-input"
      />
      <input
        type="text"
        placeholder="Value"
        value={data.varValue || ''}
        onChange={handleVarValueChange}
        className="node-input"
      />
    </div>
  );
};

export default SetVariableNode;