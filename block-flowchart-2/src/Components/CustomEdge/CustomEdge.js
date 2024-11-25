// src/Components/CustomEdge/CustomEdge.js

import React from 'react';
import { BaseEdge, getSmoothStepPath } from 'reactflow';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  source,
  target,
}) => {
  let edgePath;
  let labelX;
  let labelY;

  if (source === target) {
    // Handle loopback edge
    const loopOffset = 50; // Adjust for loop size
    edgePath = `
      M${sourceX},${sourceY}
      C${sourceX - loopOffset},${sourceY - loopOffset}
       ${targetX + loopOffset},${targetY - loopOffset}
       ${targetX},${targetY}
    `;
    labelX = sourceX;
    labelY = sourceY - loopOffset;
  } else {
    // Use getSmoothStepPath for regular edges
    [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 5,
    });
  }

  const labelWidth = label ? label.length * 7 : 0;
  const labelHeight = 16;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      {label && (
        <g>
          <rect
            x={labelX - labelWidth / 2}
            y={labelY - labelHeight / 2}
            width={labelWidth}
            height={labelHeight}
            fill="white"
            stroke="none"
          />
          <text
            x={labelX}
            y={labelY}
            fill={labelStyle?.color || '#000'}
            style={{
              fontSize: 12,
              textAnchor: 'middle',
              dominantBaseline: 'central',
              pointerEvents: 'none',
              ...labelStyle,
            }}
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
};

export default CustomEdge;