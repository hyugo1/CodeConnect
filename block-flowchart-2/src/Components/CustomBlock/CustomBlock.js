import StartBlock from './blocks/StartBlock';
import EndBlock from './blocks/EndBlock';
import IfBlock from './blocks/IfBlock';
import WhileStartBlock from './blocks/WhileStartBlock';
import WhileEndBlock from './blocks/WhileEndBlock';
import PrintBlock from './blocks/PrintBlock';
import MoveBlock from './blocks/MoveBlock';
import SetVariableBlock from './blocks/SetVariableBlock';
import ChangeVariableBlock from './blocks/ChangeVariableBlock';
import FunctionBlock from './blocks/FunctionBlock';
import DummyBlock from './blocks/DummyBlock';
import ForLoopStartBlock from './blocks/ForLoopStartBlock';
import ForLoopEndBlock from './blocks/ForLoopEndBlock';

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
  function: FunctionBlock,
  dummy: DummyBlock,
  forLoopStart: ForLoopStartBlock,
  forLoopEnd: ForLoopEndBlock,
};

const CustomBlock = ({ id, data, selected, activeBlockId }) => {
  const SpecificBlock = blockMapping[data.blockType];
  const isActive = id === activeBlockId;

  if (!SpecificBlock) {
    return (
      <div className={`block-container ${selected ? 'selected' : ''} ${isActive ? 'active' : ''}`}>
        <div>Unknown Block</div>
      </div>
    );
  }

  return <SpecificBlock id={id} data={data} selected={selected} active={isActive} />;
};

export default CustomBlock;