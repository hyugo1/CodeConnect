// src/components/ArrowBlock.js
import React from 'react';
import { useDrag } from 'react-dnd';

const ArrowBlock = ({ id }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ARROW',
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        border: '1px dashed gray',
        padding: '10px',
        margin: '10px',
        backgroundColor: isDragging ? 'lightblue' : 'white',
        cursor: 'move',
      }}
    >
      Arrow
    </div>
  );
};

export default ArrowBlock;