// src/components/OutputArea.js
import React, { useState } from 'react';

const OutputArea = () => {
  const [characterState] = useState({ x: 0, y: 0 });

  // const performActionToCharacter = (action) => {
    // Logic to update characterState based on the action
    // e.g., if action is "moveRight", increase x by a certain amount
  // };

  return (
    <div style={{ border: '1px solid #ddd', height: '100%', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: `${characterState.y}px`,
          left: `${characterState.x}px`,
          transition: 'all 0.3s',
        }}
      >
        🧍 {/* Use an icon or an animated character */}
      </div>
    </div>
  );
};

export default OutputArea;