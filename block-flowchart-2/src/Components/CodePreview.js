// src/Components/CodePreview.js
import React from 'react';
import { generateJavaScriptCode } from '../hooks/useCodeGenerator'; // adjust the path if needed

const CodePreview = ({ blocks, edges }) => {
  const generatedCode = generateJavaScriptCode(blocks, edges);
  
  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Generated Code</h3>
      <pre
        style={{
          background: '#f4f4f4',
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          overflowX: 'auto',
        }}
      >
        {generatedCode}
      </pre>
    </div>
  );
};

export default CodePreview;