// src/Components/Sidebar/Sidebar.js

import React from 'react';
import { FaPlay, FaStop, FaQuestion, FaSync, FaCheck, FaPrint } from 'react-icons/fa'; // Added FaPrint and removed FaCog

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
    { type: 'whileChecker', label: 'While Checker', color: '#f0f0f0', icon: <FaCheck /> }, // New block
    { type: 'print', label: 'Print Block', color: '#ffeeba', icon: <FaPrint /> }, // Print Block
    // { type: 'action', label: 'Action Block', color: '#d8f9f9', icon: <FaCog /> }, // Optional
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