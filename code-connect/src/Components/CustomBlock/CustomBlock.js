// src/Components/CustomBlock/CustomBlock.js

import React from 'react';
import { useActiveFlow } from '../../contexts/ActiveFlowContext';
import StartBlock from './blocks/StartBlock';
import EndBlock from './blocks/EndBlock';
import IfBlock from './blocks/IfBlock';
import WhileStartBlock from './blocks/WhileStartBlock';
import OutputBlock from './blocks/OutputBlock';
import createVariableBlock from './blocks/CreateVariableBlock';
import UpdateVariableBlock from './blocks/UpdateVariableBlock';
import DummyBlock from './blocks/DummyBlock';
import MoveBlock from './blocks/MoveBlock';
import JoinBlock from './blocks/JoinBlock';
import RotateBlock from './blocks/RotateBlock';
import InputBlock from './blocks/InputBlock'
import './CustomBlock.css';

const blockMapping = {
  start: StartBlock,
  end: EndBlock,
  if: IfBlock,
  whileStart: WhileStartBlock,
  output: OutputBlock,
  createVariable: createVariableBlock,
  updateVariable: UpdateVariableBlock,
  dummy: DummyBlock,
  move: MoveBlock,
  rotate : RotateBlock,
  join: JoinBlock,
  input: InputBlock,
};

const CustomBlock = ({ id, data, selected }) => {
  const { activeBlockId, errorBlockId, onReplace } = useActiveFlow();
  const executing = id === activeBlockId;
  const hasError = id === errorBlockId;
  const SpecificBlock = blockMapping[data.blockType];
  if (!SpecificBlock) {
    return <div className={executing ? 'executing' : ''}>Unknown Block</div>;
  }
  
  return (
    <div className={`custom-block-wrapper ${hasError ? 'error-highlight' : ''}`}>
      <SpecificBlock
        id={id}
        data={data}
        selected={selected}
        executing={executing}
        onReplace={data.blockType === 'dummy' ? onReplace : undefined}
      />
      {hasError && (
        <div className="error-snackbar">
          Error in this block!
        </div>
      )}
    </div>
  );
};

export default CustomBlock;