// src/Components/Navbar/Navbar.js

import React, { useState } from 'react';
import {
  saveFlowchart,
  loadFlowchart,
  getSavedProjects,
  deleteProject,
} from '../../utils/storage';
import './Navbar.css';

const Navbar = ({ nodes, edges, setNodes, setEdges }) => {
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState(getSavedProjects());

  const handleSaveFlowchart = () => {
    if (!projectName.trim()) {
      alert('Please enter a project name.');
      return;
    }
    saveFlowchart(projectName, nodes, edges);
    setSavedProjects(getSavedProjects());
    setProjectName('');
  };

  const handleLoadFlowchart = (name) => {
    const loadedData = loadFlowchart(name);
    if (loadedData) {
      setNodes(loadedData.nodes);
      setEdges(loadedData.edges);
    }
  };

  const handleDeleteProject = (name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProject(name);
      setSavedProjects(getSavedProjects());
    }
  };

  const handleClearFlowchart = () => {
    if (window.confirm('Are you sure you want to start a new project? Unsaved changes will be lost.')) {
      setNodes([]);
      setEdges([]);
    }
  };

  return (
    <nav className="navbar">
      <h2>Flowchart Editor</h2>
      <div className="save-load-section">
        <input
          type="text"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="project-name-input"
        />
        <button onClick={handleSaveFlowchart} className="save-button">
          Save
        </button>
        <button onClick={handleClearFlowchart} className="clear-button">
          New Project
        </button>
      </div>
      <div className="project-list-section">
        <h3>Saved Projects</h3>
        {savedProjects.length === 0 ? (
          <p>No saved projects.</p>
        ) : (
          <ul className="project-list">
            {savedProjects.map((name) => (
              <li key={name}>
                <span>{name}</span>
                <div className="project-actions">
                  <button onClick={() => handleLoadFlowchart(name)} className="load-button">
                    Load
                  </button>
                  <button onClick={() => handleDeleteProject(name)} className="delete-button">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;