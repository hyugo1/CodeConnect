// src/Components/Navbar/Navbar.js

import React, { useState, useEffect, useRef } from 'react';
import {
  exportFlowchart,
  importFlowchart,
  // Removed getSavedProjects and deleteProject if not used.
} from '../../utils/storage';
import './Navbar.css';
import {
  FaFileExport,
  FaFileImport,
  FaLightbulb,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Navbar = ({ blocks, edges, setNodes, setEdges }) => {
  // Default projectName is blank
  const [projectName, setProjectName] = useState('');
  const [showHint, setShowHint] = useState(false);
  const fileInputRef = useRef(null);

  // Export the current flowchart as a JSON file.
  const handleExportFlowchart = () => {
    // Ensure a file name is provided
    if (!projectName.trim()) {
      toast.error('Please enter a file name to export the project.');
      return;
    }
    try {
      const json = exportFlowchart(blocks, edges);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Use the provided project name
      link.download = `${projectName.trim()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Flowchart exported successfully.');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export the flowchart.');
    }
  };

  // Import a flowchart from a JSON file.
  const handleImportFlowchart = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const importedData = importFlowchart(evt.target.result);
        setNodes(importedData.blocks);
        setEdges(importedData.edges);
        toast.success('Flowchart imported successfully.');
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import flowchart: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <nav className="navbar">
      {/* Left Section: Logo and Hint Button */}
      <div className="navbar-section navbar-left">
        <h2 className="navbar-title">A Lego-like Visual Programming</h2>
        <button onClick={() => setShowHint(true)} className="hint-button" title="Show block guide">
          <FaLightbulb /> Guide
        </button>
      </div>

      {/* Center Section: Export and Import */}
      <div className="navbar-section navbar-center">
        <div className="export-import-section">
          <input
            type="text"
            placeholder="File Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="project-name-input"
          />
          <button onClick={handleExportFlowchart} className="export-button" title="Export Flowchart">
            <FaFileExport /> Export Project
          </button>
          <button onClick={() => fileInputRef.current.click()} className="import-button" title="Import Flowchart">
            <FaFileImport /> Import Project
          </button>
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImportFlowchart}
          />
        </div>
      </div>

      {/* Right Section: (Optional) Placeholder or other features */}
      <div className="navbar-section navbar-right">
        {/* You can add any additional features or leave this empty */}
      </div>

      {/* Modal for the Guide */}
      {showHint && (
        <div className="hint-modal-overlay">
          <div className="hint-modal-content">
            <h3>Block Guide</h3>
            <ul>
              <li><strong>Start:</strong> This block marks the beginning of your program.</li>
              <li><strong>End:</strong> This block marks the end of your program.</li>
              <li><strong>If Then:</strong> Use this block to create decisions.</li>
              <li><strong>While:</strong> Use this block to repeat actions as long as a condition remains true.</li>
              <li><strong>Print:</strong> Displays a message on the screen and console.</li>
              <li><strong>Set Variable:</strong> Creates a new variable with an initial value.</li>
              <li><strong>Change Variable:</strong> Updates the value of an existing variable.</li>
              <li><strong>Move:</strong> Moves your character a specified distance.</li>
              <li><strong>Dummy:</strong> A temporary block. Click to replace it with a real block.</li>
            </ul>
            <button onClick={() => setShowHint(false)} className="hint-close-button">Close</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;