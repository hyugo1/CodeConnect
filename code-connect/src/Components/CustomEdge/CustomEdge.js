//src/Components/CustomEdge/CustomEdge.js

import React, { useState } from 'react';
import { getBezierPath } from 'reactflow';
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
  activeEdgeId,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeColor = (style && style.stroke) || '#555';
  const markerEnd = 'url(#customArrow)';
  const [isHovered, setIsHovered] = useState(false);
  const executing = id === activeEdgeId;

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
        style={{ ...style, fill: 'none', color: edgeColor }}
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
              // style={{ fontSize: 18, fill: 'rgba(239, 98, 175)' }}
              style={{ fontSize: 18, fill: '#777' }}
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

{/* Animated circle: rendered only when executing */}
{/* {executing && (
  <circle r="10" fill="#ff0073">
    <animateMotion 
      begin="0s"
      dur="1.5s"
      repeatCount="indefinite"
      rotate="auto"
      calcMode="linear"
      keyTimes="0;1"
      keyPoints="0;1"
      path={edgePath}
    />
  </circle>
)} */}