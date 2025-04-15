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
  FaCodeBranch,
  FaSyncAlt
} from 'react-icons/fa';
import './BlockPalette.css';

const BlockPalette = ({ onSelectBlock, isDragging, setIsDragging, setCancelDrag, excludeStart }) => {
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

  const blocks = [
    { type: 'start', label: 'Start', color: '#d3f9d8', icon: <FaPlay />, category: 'Control Blocks' },
    { type: 'end', label: 'End', color: '#f9d8d8', icon: <FaStop />, category: 'Control Blocks' },
    { type: 'if', label: 'If Then', color: '#d8d8f9', icon: <FaCodeBranch />, category: 'Control Blocks' },
    { type: 'whileStart', label: 'While', color: '#f9f7d8', icon: <FaSync />, category: 'Control Blocks' },
    { type: 'print', label: 'Print', color: '#ffeeba', icon: <FaPrint />, category: 'Character Action Blocks' },
    { type: 'setVariable', label: 'Set Variable', color: '#e0e0e0', icon: <FaPenFancy />, category: 'Variable Blocks' },
    { type: 'changeVariable', label: 'Adjust Variable', color: '#e0ffe0', icon: <FaPlusCircle />, category: 'Variable Blocks' },
    { type: 'move', label: 'Move Character', color: '#d8f9f9', icon: <FaArrowsAltH />, category: 'Character Action Blocks' },
    { type: 'rotate', label: 'Rotate', color: '#e8e8ff', icon: <FaSyncAlt />, category: 'Character Action Blocks' },
  ];

  const filteredBlocks = excludeStart ? blocks.filter(block => block.type !== 'start') : blocks;

  const groupedBlocks = filteredBlocks.reduce((groups, block) => {
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
    <aside className={`aside-container ${collapsed ? 'collapsed' : ''}`}>
      <div className="aside-inner">
        <div className="collapse-container">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-button"
            aria-label={collapsed ? "Expand palette" : "Collapse palette"}
          >
            {collapsed ? '>' : '<'}
          </button>
        </div>
        {!collapsed && (
          <>
            <h3 className="palette-title">
              {excludeStart ? 'Select a Replacement' : 'BLOCK PALETTE'}
            </h3>
            <div className="blocks-container">
              {Object.keys(groupedBlocks).map((category) => (
                <div key={category}>
                  <h4 className="block-category">{category}</h4>
                  {groupedBlocks[category].map((block) => (
                    <div
                      key={block.type}
                      className="dndblock"
                      onClick={() => onSelectBlock(block.type)}
                      onDragStart={(event) => onDragStart(event, block.type)}
                      onDragEnd={onDragEnd}
                      draggable
                      aria-label={`Drag to add ${block.label} block`}
                      style={{ backgroundColor: block.color }} 
                    >
                      {block.icon}
                      <span>{block.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default BlockPalette;