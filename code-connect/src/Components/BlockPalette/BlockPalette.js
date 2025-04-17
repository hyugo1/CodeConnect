// src/Components/BlockPalette/BlockPalette.js
import React, { useState, useEffect } from 'react';
import {
  FaPlay,
  FaStop,
} from 'react-icons/fa';
import AddCircleIcon from '@mui/icons-material/AddCircle';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PrintIcon from '@mui/icons-material/Print';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import CreateIcon from '@mui/icons-material/Create';
import LoopIcon from '@mui/icons-material/Loop';
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
    { type: 'if', label: 'If Then', color: '#d8d8f9', icon: <CallSplitIcon />, category: 'Control Blocks' },
    { type: 'whileStart', label: 'While', color: '#f9f7d8', icon: <LoopIcon />, category: 'Control Blocks' },
    { type: 'print', label: 'Print', color: '#ffeeba', icon: <PrintIcon />, category: 'Character Action Blocks' },
    { type: 'setVariable', label: 'Set Variable', color: '#e0e0e0', icon: <CreateIcon />, category: 'Variable Blocks' },
    { type: 'adjustVariable', label: 'Adjust Variable', color: '#e0ffe0', icon: <AddCircleIcon />, category: 'Variable Blocks' },
    { type: 'move', label: 'Move Character', color: '#d8f9f9', icon: <CompareArrowsIcon />, category: 'Character Action Blocks' },
    { type: 'rotate', label: 'Rotate', color: '#e8e8ff', icon: <Rotate90DegreesCcwIcon />, category: 'Character Action Blocks' },
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
            title={collapsed ? "Expand palette" : "Collapse palette"}
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
                      <div className="icon">{block.icon}</div>
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