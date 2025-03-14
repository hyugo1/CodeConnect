// src/Components/CustomBlock/blocks/IfBlock.js

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaCodeBranch, FaQuestion } from 'react-icons/fa';
import HelpModal from '../../Modal/HelpModal';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useNodeUpdater } from '../../../hooks/useNodeUpdater';
import './block.css';

const IfBlock = ({ id, data, selected, executing }) => {
  const updateNodeData = useNodeUpdater(id);
  const [showHelp, setShowHelp] = useState(false);
  const helpText = `
• This block lets your program decide what to do next.
• In the first box, type a number or a variable name (i.e., "score").
• Next, choose a comparison operator (like >, <, or ==).
• In the second box, type another number or variable(i.e., "10").
• For instance, if you want to check whether score is greater than 10, type "score", choose ">", and then type "10".
• The program will follow the "true" path if the condition is met; otherwise, it will follow the "false" path.
• A Join block is automatically generated to combine the True and False branches—ensure you connect both paths to it to complete the flow.
`;

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
    <div className={`block-container if-block ${selected ? 'selected' : ''} ${executing ? 'executing' : ''}`}>
      <button
        onClick={() => setShowHelp(true)}
        className="help-button"
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
      <FaCodeBranch className="block-icon" />
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
          placeholder="First Value"
          value={data.leftOperand || ''}
          onChange={handleLeftOperandChange}
          className="operand-input"
        />
        <select
          value={data.operator || ''}
          onChange={handleOperatorChange}
          className="operator-select"
        >
          <option value="==">==</option>
          <option value="!=">!=</option>
          <option value="<">&lt;</option>
          <option value=">">&gt;</option>
          <option value="<=">&lt;=</option>
          <option value=">=">&gt;=</option>
        </select>
        <input
          type="text"
          placeholder="Second Value"
          value={data.rightOperand || ''}
          onChange={handleRightOperandChange}
          className="operand-input"
        />
      </div>
    </div>
  );
};

export default IfBlock;