// src/components/Block.js
import React from 'react';
import { useDrag } from 'react-dnd';
import './Block.css';

function Block({ id, type, children }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BLOCK',
    item: { id, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        border: '1px solid black',
        padding: '20px',
        margin: '10px',
        backgroundColor: isDragging ? 'lightgreen' : 'white',
        cursor: 'move',
      }}
    >
      {children}
    </div>
  );
}

export default Block;