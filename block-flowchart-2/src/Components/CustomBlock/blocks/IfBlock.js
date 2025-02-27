// src/Components/CustomNode/blocks/IfBlock.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const conditionStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 10,
};
const inputStyle = {
  flex: 1,
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  // fontsize: '20px',
  marginRight: '5px',
};
const selectStyle = {
  padding: '5px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  // fontsize: '20px',
  marginRight: '5px',
};

const IfBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);

  const handleLeftOperandChange = (e) => {
    updateNodeData({ leftOperand: e.target.value });
  };

  const handleOperatorChange = (e) => {
    updateNodeData({ operator: e.target.value });
  };

  const handleRightOperandChange = (e) => {
    updateNodeData({ rightOperand: e.target.value });
  };

  return (
    <div
      className={`block-container if-block ${selected ? 'selected' : ''} ${
        executing ? 'executing' : ''
      }`}
      style={{ backgroundColor: '#d8d8f9' }}
    >
      <FaQuestion style={{ marginBottom: 5 }} />
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
      <Handle
        type="source"
        position={Position.Bottom}
        id={`yes-${id}`}
        className="handle-source-square"
        style={{ left: '25%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-yes`}
        data-tooltip-content="True Branch"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`no-${id}`}
        className="handle-source-square"
        style={{ left: '75%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-no`}
        data-tooltip-content="False Branch"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-yes`} place="top" />
      <Tooltip id={`tooltip-${id}-no`} place="top" />
      <div style={conditionStyle}>
        <input
          type="text"
          placeholder="Left Operand"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          style={inputStyle}
        />
        <select
          value={data.operator || ''}
          onChange={handleOperatorChange}
          style={selectStyle}
        >
          <option value="">Op</option>
          <option value="<">&lt;</option>
          <option value=">">&gt;</option>
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
        </select>
        <input
          type="text"
          placeholder="Right Operand"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          style={inputStyle}
        />
      </div>
    </div>
  );
};

export default IfBlock;