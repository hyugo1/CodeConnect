import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const IfBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• Enter a condition using two operands and an operator.
• The true branch (left) and false branch (right) will execute based on the condition.`;

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
      className={`block-container if-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#d8d8f9', position: 'relative' }}
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
        title="If Then Block Help"
        onClose={() => setShowHelp(false)}
      />
      <div>{data.label || 'If Then'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
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
      <div className="condition-container">
        <input
          type="text"
          placeholder="First Variable"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          className="operand-input"
        />
        <select value={data.operator || ''} onChange={handleOperatorChange} className="operator-select">
          <option value="<">&lt;</option>
          <option value=">">&gt;</option>
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
        </select>
        <input
          type="text"
          placeholder="Second Variable"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          className="operand-input"
        />
      </div>
    </div>
  );
};

export default IfBlock;