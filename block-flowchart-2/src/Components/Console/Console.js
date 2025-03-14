// src/Components/Console/Console.js

import React, { useState } from 'react';
import './Console.css';

function Console({ consoleOutput }) {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  return (
    <div className={`console ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="console-header">
        <h3>Console Output</h3>
        <button className="console-toggle-button" onClick={toggleMinimize}>
          {isMinimized ? 'Expand' : 'Minimize'}
        </button>
      </div>
      <pre className="console-pre">
        {consoleOutput}
      </pre>
    </div>
  );
}

export default Console;