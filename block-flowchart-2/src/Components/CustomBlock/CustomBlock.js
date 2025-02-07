// src/Components/CustomBlock/CustomBlock.js
import React from 'react';

import StartBlock from './blocks/StartBlock';
import EndBlock from './blocks/EndBlock';
import IfBlock from './blocks/IfBlock';
import WhileStartBlock from './blocks/WhileStartBlock';
import WhileEndBlock from './blocks/WhileEndBlock';
import PrintBlock from './blocks/PrintBlock';
import MoveBlock from './blocks/MoveBlock';
import SetVariableBlock from './blocks/SetVariableBlock';
import ChangeVariableBlock from './blocks/ChangeVariableBlock';
import OperatorBlock from './blocks/OperatorBlock';
import DummyBlock from './blocks/DummyBlock';

const blockMapping = {
  start: StartBlock,
  end: EndBlock,
  if: IfBlock,
  whileStart: WhileStartBlock,
  whileEnd: WhileEndBlock,
  print: PrintBlock,
  move: MoveBlock,
  setVariable: SetVariableBlock,
  changeVariable: ChangeVariableBlock,
  operator: OperatorBlock,
  dummy: DummyBlock,
};

const CustomBlock = ({ id, data, selected }) => {
  const SpecificBlock = blockMapping[data.blockType];

  if (!SpecificBlock) {
    return (
      <div className={`block-container ${selected ? 'selected' : ''}`}>
        <div>Unknown Block</div>
      </div>
    );
  }

  return <SpecificBlock id={id} data={data} selected={selected} />;
};

export default CustomBlock;