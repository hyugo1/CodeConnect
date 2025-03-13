import React from 'react';
import StartBlock from './blocks/StartBlock';
import EndBlock from './blocks/EndBlock';
import IfBlock from './blocks/IfBlock';
import WhileStartBlock from './blocks/WhileStartBlock';
import PrintBlock from './blocks/PrintBlock';
import SetVariableBlock from './blocks/SetVariableBlock';
import ChangeVariableBlock from './blocks/ChangeVariableBlock';
import DummyBlock from './blocks/DummyBlock';
// import ResizeBlock from './blocks/ResizeBlock';
// import RotateBlock from './blocks/RotateBlock';
import MoveBlock from './blocks/MoveBlock';
import JoinBlock from './blocks/JoinBlock';

const blockMapping = {
  start: StartBlock,
  end: EndBlock,
  if: IfBlock,
  whileStart: WhileStartBlock,
  print: PrintBlock,
  setVariable: SetVariableBlock,
  changeVariable: ChangeVariableBlock,
  dummy: DummyBlock,
  // resize: ResizeBlock,
  // rotate: RotateBlock,
  move: MoveBlock,
  join: JoinBlock,
};

const CustomBlock = ({ id, data, selected, activeBlockId, onReplace }) => {
  const executing = id === activeBlockId;
  const SpecificBlock = blockMapping[data.blockType];
  if (!SpecificBlock) {
    return <div className={executing ? 'executing' : ''}>Unknown Block</div>;
  }
  
  return (
    <SpecificBlock
      id={id}
      data={data}
      selected={selected}
      executing={executing}
      // Only pass onReplace to dummy blocks
      onReplace={data.blockType === 'dummy' ? onReplace : undefined}
    />
  );
};

export default CustomBlock;