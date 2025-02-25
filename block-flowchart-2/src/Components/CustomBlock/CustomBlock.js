// src/Components/CustomBlock/CustomBlock.js
import React from 'react';
import StartBlock from './blocks/StartBlock';
import EndBlock from './blocks/EndBlock';
import IfBlock from './blocks/IfBlock';
import WhileStartBlock from './blocks/WhileStartBlock';
import PrintBlock from './blocks/PrintBlock';
import SetVariableBlock from './blocks/SetVariableBlock';
import ChangeVariableBlock from './blocks/ChangeVariableBlock';
import DummyBlock from './blocks/DummyBlock';

const blockMapping = {
  start: StartBlock,
  end: EndBlock,
  if: IfBlock,
  whileStart: WhileStartBlock,
  print: PrintBlock,
  setVariable: SetVariableBlock,
  changeVariable: ChangeVariableBlock,
  dummy: DummyBlock,
};

const CustomBlock = ({ id, data, selected, activeBlockId, onReplace }) => {
  const executing = id === activeBlockId;
  const SpecificBlock = blockMapping[data.blockType];
  if (!SpecificBlock) {
    return <div className={executing ? 'executing' : ''}>Unknown Block</div>;
  }

  // For dummy blocks, pass down the onReplace callback
  return <SpecificBlock id={id} data={data} selected={selected} executing={executing} onReplace={onReplace} />;
};

export default CustomBlock;