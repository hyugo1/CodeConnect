import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaSync, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal.js';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const WhileStartBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• Enter a condition using two operands and an operator.
• The loop body will execute while the condition is true.
• Connect the loop body and exit paths accordingly.`;

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
      className={`block-container while-start-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}
      style={{ backgroundColor: '#f9f7d8', position: 'relative' }}
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
        title="While Block Help"
        onClose={() => setShowHelp(false)}
      />
      <FaSync style={{ marginBottom: 5 }} />
      <div>{data.label || 'While'}</div>
      <Handle
        type="target"
        position={Position.Top}
        id={`target-${id}`}
        className="handle-target-circle"
        data-tooltip-id={`tooltip-${id}-target`}
        data-tooltip-content="Connect from previous block"
        isConnectable={true}
      />
      <div className="condition-container">
        <input
          type="text"
          placeholder="First Variable"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          className="operand-input"
        />
        <select value={data.operator || ''} onChange={handleOperatorChange} className="operator-select">
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
          placeholder="Second Variable"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          className="operand-input"
        />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id={`body-${id}`}
        className="handle-source-square"
        style={{ left: '25%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-body`}
        data-tooltip-content="If condition true, enter loop body"
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id={`exit-${id}`}
        className="handle-source-square"
        style={{ left: '75%', top: '100%' }}
        data-tooltip-id={`tooltip-${id}-exit`}
        data-tooltip-content="If condition false, exit loop"
        isConnectable={true}
      />
      <Handle
        type="target"
        position={Position.Left}
        id={`loopBack-${id}`}
        className="handle-target-circle"
        style={{ left: '0%', top: '50%' }}
        data-tooltip-id={`tooltip-${id}-loopBack`}
        data-tooltip-content="Connect back for looping"
        isConnectable={true}
      />
      <Tooltip id={`tooltip-${id}-target`} place="top" />
      <Tooltip id={`tooltip-${id}-body`} place="top" />
      <Tooltip id={`tooltip-${id}-exit`} place="top" />
      <Tooltip id={`tooltip-${id}-loopBack`} place="top" />
    </div>
  );
};

export default WhileStartBlock;