// src/Components/BlockPalette/BlockPalette.js
import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaStop,
  FaQuestion,
  FaSync,
  FaPrint,
  FaPenFancy,
  FaPlusCircle,
  FaArrowsAltH,
  FaSyncAlt,
  FaExpandArrowsAlt
} from 'react-icons/fa';
import './BlockPalette.css';

const BlockPalette = ({ onSelectBlock, isDragging, setIsDragging, setCancelDrag }) => {
  // State to track collapse
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

  // Define blocks with an additional "category" property.
  const blocks = [
    { type: 'start', label: 'Start', color: '#d3f9d8', icon: <FaPlay />, category: 'Basic Blocks: Start' },
    { type: 'end', label: 'End', color: '#f9d8d8', icon: <FaStop />, category: 'Basic Blocks: End' },
    { type: 'if', label: 'If-Then', color: '#d8d8f9', icon: <FaQuestion />, category: 'Control Blocks' },
    { type: 'while', label: 'While', color: '#f9f7d8', icon: <FaSync />, category: 'Control Blocks' },
    { type: 'print', label: 'Print', color: '#ffeeba', icon: <FaPrint />, category: 'I/O Blocks' },
    { type: 'setVariable', label: 'Set Variable', color: '#e0e0e0', icon: <FaPenFancy />, category: 'Variable Blocks' },
    { type: 'changeVariable', label: 'Change Variable', color: '#e0ffe0', icon: <FaPlusCircle />, category: 'Variable Blocks' },
    { type: 'move', label: 'Move Character', color: '#d8f9f9', icon: <FaArrowsAltH />, category: 'Character Action Blocks' },
  ];

  // Group blocks by their category.
  const groupedBlocks = blocks.reduce((groups, block) => {
    const cat = block.category || 'Other';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(block);
    return groups;
  }, {});

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
        width: collapsed ? '40px' : '250px',
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
          {Object.keys(groupedBlocks).map((category) => (
            <div key={category}>
              <h4 style={{ marginTop: '20px', marginBottom: '5px', borderBottom: '1px solid #555' }}>
                {category}
              </h4>
              {groupedBlocks[category].map((block) => (
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
            </div>
          ))}
        </>
      )}
    </aside>
  );
};

export default BlockPalette;