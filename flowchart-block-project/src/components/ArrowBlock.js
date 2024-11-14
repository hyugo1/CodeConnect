// src/components/ArrowBlock.js
import React from 'react';
import { useDrag } from 'react-dnd';
// import Draggable from 'react-draggable';

const ArrowBlock = ({ id, onDropConnection }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ARROW',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    // <Draggable>
    <div
      ref={drag}
      style={{
        border: '1px dashed gray',
        padding: '10px',
        margin: '10px',
        backgroundColor: isDragging ? 'lightblue' : 'white',
        cursor: 'move',
        height: '50px',
        width: '40px'
      }}
    >Arrow
    </div>
  );
};

export default ArrowBlock;