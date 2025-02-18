// src/Components/CodePreview.js
import React, { useState } from 'react';
import { generateJavaScriptCode } from '../hooks/useCodeGenerator';
import './Console/Console.css';

const CodePreview = ({ blocks, edges }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const generatedCode = generateJavaScriptCode(blocks, edges);

  const toggleMinimize = () => {
    setIsMinimized(prev => !prev);
  };

  return (
    <div className={`code-preview ${isMinimized ? 'minimized' : 'expanded'}`}>
      <div className="console-header">
        <h3>Generated Code</h3>
        <button className="console-toggle-button" onClick={toggleMinimize}>
          {isMinimized ? 'Expand' : 'Minimize'}
        </button>
      </div>
      <pre className="console-pre">
        {generatedCode}
      </pre>
    </div>
  );
};

export default CodePreview;