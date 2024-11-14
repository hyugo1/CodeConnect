// src/components/DropZone.js
import React from 'react';
import { useDrop } from 'react-dnd';
// import './DropZone.css';

const DropZone = ({ onDrop }) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div ref={drop} className={`drop-zone ${canDrop && isOver ? 'over' : ''}`}>
      {canDrop && isOver ? 'Release to drop' : 'Drag a block here'}
    </div>
  );
};

export default DropZone;