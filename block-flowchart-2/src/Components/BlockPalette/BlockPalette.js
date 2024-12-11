// src/Components/BlockPalette/BlockPalette.js

import React from 'react';
import {
  FaPlay,
  FaStop,
  FaQuestion,
  FaSync,
  FaPrint,
  FaArrowsAltH,
  FaPenFancy,
  FaPlusCircle,
} from 'react-icons/fa';
import './BlockPalette.css';

const BlockPalette = ({ onSelectBlock }) => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const blockStyle = {
    margin: '10px 0',
    padding: '10px',
    cursor: 'grab', // Indicate draggable
    borderRadius: '5px',
    color: '#000',
    fontWeight: 'bold',
    border: '2px solid #555',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  };

  const blocks = [
    { type: 'start', label: 'Start', color: '#d3f9d8', icon: <FaPlay /> },
    { type: 'end', label: 'End', color: '#f9d8d8', icon: <FaStop /> },
    { type: 'if', label: 'If-Then', color: '#d8d8f9', icon: <FaQuestion /> },
    { type: 'while', label: 'While', color: '#f9f7d8', icon: <FaSync /> },
    { type: 'print', label: 'Print', color: '#ffeeba', icon: <FaPrint /> },
    // Movement blocks
    { type: 'move', label: 'Move', color: '#d8f9f9', icon: <FaArrowsAltH /> },
    // Operator block
    { type: 'operator', label: 'Operator', color: '#f9d8f9', icon: <FaPlusCircle /> },
    // Set variable
    { type: 'setVariable', label: 'Set Variable', color: '#e0e0e0', icon: <FaPenFancy /> },
    { type: 'ChangeVariable', label: 'Change Variable', color: '#e0ffe0', icon: <FaPlusCircle /> },
  ];

  return (
    <aside style={{ padding: '10px', backgroundColor: '#eee', width: '220px', overflowY: 'auto', height: '100vh' }}>
      <h3 style={{ textAlign: 'center' }}>Blocks</h3>
      {blocks.map((block) => (
        <div
          key={block.type}
          style={{
            ...blockStyle,
            backgroundColor: block.color,
            border: '2px solid #555',
          }}
          onClick={() => onSelectBlock(block.type)}
          onDragStart={(event) => onDragStart(event, block.type)}
          draggable
        >
          {block.icon}
          <span style={{ marginLeft: '8px' }}>{block.label}</span>
        </div>
      ))}
    </aside>
  );
};

export default BlockPalette;