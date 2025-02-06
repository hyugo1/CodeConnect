// src/Components/BlockPalette/BlockPalette.js

import React, { useState, useEffect } from 'react';
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

const BlockPalette = ({ onSelectBlock, isDragging, setIsDragging, setCancelDrag }) => {
  // state to track for collapse
  const [collapsed, setCollapsed] = useState(false);

  const onDragStart = (event, blockType) => {
    event.dataTransfer.setData('application/reactflow', blockType);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setCancelDrag(false);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    setCancelDrag(false);
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
    { type: 'start', label: 'Start', color: '#d3f9d8', icon: <FaPlay /> },
    { type: 'end', label: 'End', color: '#f9d8d8', icon: <FaStop /> },
    { type: 'if', label: 'If-Then', color: '#d8d8f9', icon: <FaQuestion /> },
    { type: 'while', label: 'While', color: '#f9f7d8', icon: <FaSync /> },
    { type: 'print', label: 'Print', color: '#ffeeba', icon: <FaPrint /> },
    { type: 'move', label: 'Move', color: '#d8f9f9', icon: <FaArrowsAltH /> },
    { type: 'operator', label: 'Operator', color: '#f9d8f9', icon: <FaPlusCircle /> },
    { type: 'setVariable', label: 'Set Variable', color: '#e0e0e0', icon: <FaPenFancy /> },
    { type: 'changeVariable', label: 'Change Variable', color: '#e0ffe0', icon: <FaPlusCircle /> },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isDragging && e.key === 'Escape') {
        setCancelDrag(true);
        setIsDragging(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDragging, setCancelDrag, setIsDragging]);

  return (
    <aside
      style={{
        padding: '10px',
        backgroundColor: '#eee',
        width: collapsed ? '40px' : '220px',
        overflowY: 'auto',
        height: '100vh',
        transition: 'width 0.3s',
        border: '2px solid #555',
      }}
    >
      {/* Toggle button to collapse/expand the palette */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          marginBottom: '10px',
          width: '100%',
          padding: '5px',
          cursor: 'pointer',
          border: '2px solid #555',
          backgroundColor: '#fff',
          borderRadius: '4px',
        }}
      >
        {collapsed ? '>' : '<'}
      </button>
      {!collapsed && (
        <>
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
              onDragEnd={onDragEnd}
              draggable
            >
              {block.icon}
              <span style={{ marginLeft: '8px' }}>{block.label}</span>
            </div>
          ))}
        </>
      )}
    </aside>
  );
};

export default BlockPalette;