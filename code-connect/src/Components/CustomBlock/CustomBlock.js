// src/Components/CustomBlock/CustomBlock.js

import React from 'react';
import { useActiveFlow } from '../../contexts/ActiveFlowContext';
import StartBlock from './blocks/StartBlock';
import EndBlock from './blocks/EndBlock';
import IfBlock from './blocks/IfBlock';
import WhileStartBlock from './blocks/WhileStartBlock';
import PrintBlock from './blocks/PrintBlock';
import SetVariableBlock from './blocks/SetVariableBlock';
import ChangeVariableBlock from './blocks/ChangeVariableBlock';
import DummyBlock from './blocks/DummyBlock';
import MoveBlock from './blocks/MoveBlock';
import JoinBlock from './blocks/JoinBlock';
import './CustomBlock.css';

const blockMapping = {
  start: StartBlock,
  end: EndBlock,
  if: IfBlock,
  whileStart: WhileStartBlock,
  print: PrintBlock,
  setVariable: SetVariableBlock,
  changeVariable: ChangeVariableBlock,
  dummy: DummyBlock,
  move: MoveBlock,
  join: JoinBlock,
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