import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import Draggable from 'react-draggable';
import DraggableBlock from './DraggableBlock';
import ArrowBlock from './ArrowBlock';
import './DropZone.css';

const FlowchartCanvas = ({ isPalette }) => {
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [connections, setConnections] = useState([]);

  const [, drop] = useDrop({
    accept: ['BLOCK', 'ARROW'],
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();

      if (clientOffset) {
        if (item.type === 'BLOCK') {
          // Handle regular block drop
          addBlockToCanvas(item, clientOffset);
        } else if (item.type === 'ARROW') {
          // Handle ArrowBlock
          if (droppedBlocks.length >= 2) {
            const fromBlockId = droppedBlocks[droppedBlocks.length - 2].id;
            const toBlockId = droppedBlocks[droppedBlocks.length - 1].id;
            connectArrowBlock(fromBlockId, toBlockId);
          }
        }
      }
    },
  });

  const addBlockToCanvas = (item, offset) => {
    const canvasRect = document.getElementById("canvas-container").getBoundingClientRect();
    const x = offset.x - canvasRect.left;
    const y = offset.y - canvasRect.top;
    const blockName = `${item.name} ${droppedBlocks.filter(b => b.name.startsWith(item.name)).length + 1}`;  
    setDroppedBlocks((prevBlocks) => [
      ...prevBlocks,
      { ...item, id: `${item.id}-${Date.now()}`, x, y, name: blockName },
    ]);
  };

  const connectArrowBlock = (fromBlockId, toBlockId) => {
    setConnections((prevConnections) => [
      ...prevConnections,
      { from: fromBlockId, to: toBlockId },
    ]);
  };

  return (
    <div
      id="canvas-container"
      ref={drop}
      style={{
        position: 'relative',
        minHeight: '400px',
        maxWidth: '1000px',
        padding: isPalette ? '10px' : '20px',
        background: isPalette ? '#f9f9f9' : '#e9e9e9',
        border: '2px dashed #ccc',
      }}
    >
      {isPalette &&
        ['Start', 'Process', 'End'].map((name, index) => (
          <DraggableBlock key={index} id={`${name}-${index}`} type="BLOCK" name={name} />
        ))}

      {isPalette && <ArrowBlock type="ARROW" />}

      {!isPalette &&
        droppedBlocks.map((block) => (
          <Draggable
            key={block.id}
            defaultPosition={{ x: block.x, y: block.y }}
          >
            <div
              style={{
                position: 'absolute',
                border: '1px solid black',
                padding: '20px',
                backgroundColor: '#fff',
                cursor: 'move',
              }}
            >
              {block.name}
            </div>
          </Draggable>
        ))}
      
      {/* Render connections */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
        {connections.map((connection, index) => {
          const fromBlock = droppedBlocks.find(block => block.id === connection.from);
          const toBlock = droppedBlocks.find(block => block.id === connection.to);

          if (fromBlock && toBlock) {
            return (
              <line
                key={index}
                x1={fromBlock.x + 50}
                y1={fromBlock.y + 50}
                x2={toBlock.x + 50}
                y2={toBlock.y + 50}
                stroke="black"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          }
          return null;
        })}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};

export default FlowchartCanvas;