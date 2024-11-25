// src/Components/Sidebar/Sidebar.js

import React from 'react';
import {
  FaPlay,
  FaStop,
  FaQuestion,
  FaSync,
  FaCheck,
  FaPrint,
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowsAltH,
  FaPlus,
  FaMinus,
  FaTimes,
  FaDivide,
} from 'react-icons/fa'; // Import movement icons
import './Sidebar.css';

const Sidebar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const blockStyle = {
    margin: '10px 0',
    padding: '10px',
    cursor: 'grab',
    borderRadius: '5px',
    color: '#000',
    fontWeight: 'bold',
    border: '2px solid #555',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  };

  const blocks = [
    { type: 'start', label: 'Start Block', color: '#d3f9d8', icon: <FaPlay /> },
    { type: 'end', label: 'End Block', color: '#f9d8d8', icon: <FaStop /> },
    { type: 'if', label: 'If-Then Block', color: '#d8d8f9', icon: <FaQuestion /> },
    { type: 'while', label: 'While Block', color: '#f9f7d8', icon: <FaSync /> },
    { type: 'print', label: 'Print Block', color: '#ffeeba', icon: <FaPrint /> },
    // Movement blocks
    { type: 'moveUp', label: 'Move Up', color: '#d8f9f9', icon: <FaArrowUp /> },
    { type: 'moveDown', label: 'Move Down', color: '#d8f9f9', icon: <FaArrowDown /> },
    { type: 'moveLeft', label: 'Move Left', color: '#d8f9f9', icon: <FaArrowLeft /> },
    { type: 'moveRight', label: 'Move Right', color: '#d8f9f9', icon: <FaArrowRight /> },
    { type: 'move', label: 'Move', color: '#d8f9f9', icon: <FaArrowsAltH /> }, // Generic move block
      // Math operator blocks
      { type: 'add', label: 'Add', color: '#f9d8f9', icon: <FaPlus /> },
      { type: 'subtract', label: 'Subtract', color: '#f9d8f9', icon: <FaMinus /> },
      { type: 'multiply', label: 'Multiply', color: '#f9d8f9', icon: <FaTimes /> },
      { type: 'divide', label: 'Divide', color: '#f9d8f9', icon: <FaDivide /> },
    ];
  
    return (
      <aside style={{ padding: '10px', backgroundColor: '#eee', width: '220px' }}>
        <h3 style={{ textAlign: 'center' }}>Blocks</h3>
        {blocks.map((block) => (
          <div
            key={block.type}
            style={{
              ...blockStyle,
              backgroundColor: block.color,
            }}
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
  
  export default Sidebar;