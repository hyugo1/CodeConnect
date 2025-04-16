// src/Components/Console/Console.js

import React, { useState } from 'react';
import './Console.css';

function Console({ consoleOutput }) {
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  const lines = consoleOutput ? consoleOutput.split('\n') : [];

  return (
    <div className={`console ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="console-header">
        <h3>Console Output</h3>
        <button className="console-toggle-button" onClick={toggleMinimize}>
          {isMinimized ? 'Show' : 'Hide'}
        </button>
      </div>
      <pre className="console-pre">
        {lines.map((line, idx) => {
          if (line.startsWith("Error:")) {
            return (
              <div key={idx} className="error-line">
                {line}
              </div>
            );
          }
          return <div key={idx}>{line}</div>;
        })}
      </pre>
    </div>
  );
}

export default Console;