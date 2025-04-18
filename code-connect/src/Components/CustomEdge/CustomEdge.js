//src/Components/CustomEdge/CustomEdge.js

import React, { useState } from 'react';
import { getBezierPath } from 'reactflow';
import { useActiveFlow } from '../../contexts/ActiveFlowContext';
import './CustomEdge.css';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  label,
  selected,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { activeEdgeId } = useActiveFlow();
  const markerEnd = 'url(#customArrow)';
  const [isHovered, setIsHovered] = useState(false);
  const executing = id === activeEdgeId;
  const isDarkMode = document.body.classList.contains('dark-mode');

  const computedStyle = {
    ...style,
    fill: 'none',
    stroke: isDarkMode
      ? label === 'Loop Back'
        ? '#c933ff'
        : label === 'True'
          ? '#28a745'
          : label === 'False'
            ? '#dc3545'
            : '#e0e0e0' 
      : label === 'Loop Back'
        ? '#c933ff'
        : label === 'True'
          ? '#28a745'
          : label === 'False'
            ? '#dc3545'
            : style.stroke || '#e0e0e0', 
  };

  const invisiblePathStyle = {
    stroke: 'transparent',
    strokeWidth: 50,
    cursor: 'pointer',
    fill: 'none',
  };

  return (
    <>
      <svg style={{ position: 'absolute', height: 0, width: 0 }}>
        <defs>
          <marker
            id="customArrow"
            markerWidth="6"
            markerHeight="6"
            refX="1.5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>

      <path
        id={`${id}-invisible`}
        data-id={id}
        d={edgePath}
        style={invisiblePathStyle}
        pointerEvents="stroke"
        fill="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="react-flow__edge-interaction"
      />
      <path
        id={id}
        d={edgePath}
        style={computedStyle}
        className={`react-flow__edge-path 
          ${selected ? 'selected' : ''} 
          ${isHovered ? 'hovered' : ''} 
          ${executing ? 'executing' : ''}`}
        markerEnd={markerEnd}
      />

        {label && (
          <text dy="-5">
            <textPath
                href={`#${id}`}
                className={`edge-label ${label === 'Loop Back' ? 'edge-label-loop' : label === 'True' ? 'edge-label-true' : label === 'False' ? 'edge-label-false' : ''}`}
                style={{ fontSize: 18 }}
                startOffset="50%"
                textAnchor="middle"
              >
                {label}
              </textPath>
          </text>
        )}
    </>
  );
};

export default CustomEdge;