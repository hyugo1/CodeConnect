// src/Components/CustomEdge/CustomEdge.js
import React, { useState } from 'react';
import { getBezierPath, getMarkerEnd } from 'reactflow';
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
  markerEnd,
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

  const markerType = getMarkerEnd(markerEnd, 'end');

  const [isHovered, setIsHovered] = useState(false);

  // Increase strokeWidth to 30 for a larger clickable area
  const invisiblePathStyle = {
    stroke: 'transparent',
    strokeWidth: 30,
    cursor: 'pointer',
    fill: 'none',
  };

  return (
    <>
      {/* Invisible path for easier clicking */}
      <path
        id={`${id}-invisible`}
        d={edgePath}
        style={invisiblePathStyle}
        pointerEvents="stroke"
        fill="none"
        onClick={(event) => {
          event.stopPropagation();
          // Selection is handled elsewhere (e.g. via onEdgeClick in ReactFlow)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {/* Visible edge path */}
      <path
        id={id}
        style={{ ...style, fill: 'none' }}
        className={`react-flow__edge-path ${selected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        d={edgePath}
        markerEnd={markerType}
      />
      {label && (
        <text>
          <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      )}
    </>
  );
};

export default CustomEdge;