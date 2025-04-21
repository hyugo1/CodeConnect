// src/Components/BlockPalette/BlockPalette.js
import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaStop } from 'react-icons/fa';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PrintIcon from '@mui/icons-material/Print';
import Rotate90DegreesCcwIcon from '@mui/icons-material/Rotate90DegreesCcw';
import CreateIcon from '@mui/icons-material/Create';
import LoopIcon from '@mui/icons-material/Loop';
import InputIcon from '@mui/icons-material/Input';
import './BlockPalette.css';

const BlockPalette = ({
  onSelectBlock,
  isDragging,
  setIsDragging,
  setCancelDrag,
  excludeStart
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState(350);
  const [resizing, setResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const onMouseDownResizer = e => {
    e.preventDefault();
    setResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  useEffect(() => {
    const onMouseMove = e => {
      if (!resizing) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.max(60, Math.min(startWidthRef.current + delta, 800));
      setWidth(newWidth);
    };
    const onMouseUp = () => {
      if (resizing) setResizing(false);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing]);

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
    { type: 'start',         label: 'Start',           color: '#d3f9d8', icon: <FaPlay />,                category: 'Terminal Blocks' },
    { type: 'end',           label: 'End',             color: '#f9d8d8', icon: <FaStop />,                category: 'Terminal Blocks' },
    { type: 'if',            label: 'If Then',         color: '#d8d8f9', icon: <CallSplitIcon />,         category: 'Control Blocks' },
    { type: 'whileStart',    label: 'While',           color: '#f9f7d8', icon: <LoopIcon />,              category: 'Control Blocks' },
    { type: 'input',         label: 'Input',           color: '#e0f7fa', icon: <InputIcon />,    category: 'Input/Output Blocks' },
    { type: 'print',         label: 'Print',           color: '#ffeeba', icon: <PrintIcon />,             category: 'Input/Output Blocks' },
    { type: 'createVariable',   label: 'Create Variable',    color: '#e0e0e0', icon: <CreateIcon />,            category: 'Variable Blocks' },
    { type: 'adjustVariable',label: 'Adjust Variable', color: '#e0ffe0', icon: <AddCircleIcon />,         category: 'Variable Blocks' },
    { type: 'move',          label: 'Move Character',  color: '#d8f9f9', icon: <CompareArrowsIcon />,    category: 'Character Action Blocks' },
    { type: 'rotate',        label: 'Rotate',          color: '#e8e8ff', icon: <Rotate90DegreesCcwIcon />, category: 'Character Action Blocks' },
  ];
  const filtered = excludeStart
    ? blocks.filter(b => b.type !== 'start')
    : blocks;
  const grouped = filtered.reduce((acc, block) => {
    const cat = block.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(block);
    return acc;
  }, {});

  useEffect(() => {
    const onKey = e => {
      if (isDragging && e.key === 'Escape') {
        setCancelDrag(true);
        setIsDragging(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDragging, setCancelDrag, setIsDragging]);

  return (
      <aside
        className={
          `aside-container ` +
          (collapsed   ? 'collapsed ' : '') +
          (resizing    ? 'resizing'  : '')
        }
        style={{ width: collapsed ? 100 : width }}
      >
      {!collapsed && <div className="resizer" onMouseDown={onMouseDownResizer} />}

      <div className="aside-inner">
        <div className="collapse-container">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-button"
            aria-label={collapsed ? 'Expand palette' : 'Collapse palette'}
            title={collapsed ? 'Expand palette' : 'Collapse palette'}
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
              {Object.keys(grouped).map(category => (
                <div key={category}>
                  <h4 className="block-category">{category}</h4>
                  {grouped[category].map(block => (
                    <div
                      key={block.type}
                      className="dndblock"
                      onClick={() => onSelectBlock(block.type)}
                      onDragStart={e => onDragStart(e, block.type)}
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