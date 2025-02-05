// src/Components/Console.js

import React from 'react';
// import './Console.css';

function Console({ consoleOutput }) {
  return (
    <div className="console">
      <h3>Console Output</h3>
      <pre>{consoleOutput}</pre>
    </div>
  );
}

export default Console;