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
  // Generate a Bezier path for the edge
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Use the provided stroke color, or default to #555
  const edgeColor = (style && style.stroke) || '#555';

  // Use the custom marker defined below.
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
      {/* Inline SVG definitions for custom markers */}
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

      {/* Invisible path for easier edge selection */}
      <path
        id={`${id}-invisible`}
        d={edgePath}
        style={invisiblePathStyle}
        pointerEvents="stroke"
        fill="none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {/* Visible edge with the custom arrow marker and dynamic color */}
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

      {/* Optional label displayed along the edge path */}
      {label && (
        <text dy="-5">
          <textPath href={`#${id}`} style={{ fontSize: 18 }} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default CustomEdge;