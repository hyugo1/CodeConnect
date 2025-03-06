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
  // Generate a Bezier path. React Flow's internal geometry will handle smoothstep if
  // you set 'smoothstep' as the type in FlowchartCanvas. Or you can import
  // getSmoothStepPath if you want to handle that logic here explicitly.
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // If style.stroke is defined, use that color. Otherwise, default to #555.
  const edgeColor = (style && style.stroke) || '#555';

  // Use our custom marker. "currentColor" in the marker path
  // ensures the arrow matches edgeColor.
  const markerEnd = 'url(#customArrow)';

  const [isHovered, setIsHovered] = useState(false);
  const executing = id === activeEdgeId;

  // Increase the clickable area with an invisible path.
  const invisiblePathStyle = {
    stroke: 'transparent',
    strokeWidth: 30,
    cursor: 'pointer',
    fill: 'none',
  };

  return (
    <>
      {/* Inline SVG definitions for custom markers */}
      <svg style={{ height: 0, width: 0 }}>
        <defs>
          <marker
            id="customArrow"
            markerWidth="8"
            markerHeight="8"
            refX="2"     // Pulls the arrow tip closer to the end of the path
            refY="4"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,8 L8,4 z" fill="currentColor" />
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
        onClick={(event) => event.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Visible edge with the custom arrow marker and dynamic color */}
      <path
        id={id}
        d={edgePath}
        // "color" sets the arrow’s fill via currentColor
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