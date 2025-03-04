import React, { useState, useEffect } from 'react';
import {
  saveFlowchart,
  loadFlowchart,
  getSavedProjects,
  deleteProject,
} from '../../utils/storage';
import './Navbar.css';
import { FaFolderOpen, FaTrash, FaLightbulb } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Navbar = ({ blocks, edges, setNodes, setEdges }) => {
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState(getSavedProjects());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const projects = getSavedProjects();
    setSavedProjects(projects);
  }, []);

  const handleSaveFlowchart = () => {
    try {
      const sanitizedProjectName = projectName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      if (!sanitizedProjectName) {
        toast.error('Please enter a valid project name (letters, numbers, underscores, or dashes).');
        return;
      }

      // Check if a project with the same name already exists
      const existingProjects = getSavedProjects();
      if (existingProjects.includes(sanitizedProjectName)) {
        if (!window.confirm(`A project named "${sanitizedProjectName}" already exists. Do you want to overwrite it?`)) {
          return;
        }
      }

      // Optionally log the blocks and edges being saved
      console.log('Current blocks before saving:', JSON.stringify(blocks, null, 2));
      console.log('Current edges before saving:', JSON.stringify(edges, null, 2));

      // Serialize the nodes and edges
      const serializedNodes = blocks.map(({ id, type, position, data }) => ({ id, type, position, data }));
      const serializedEdges = edges.map(({ id, source, target, sourceHandle, targetHandle, type, animated, markerEnd, style, label }) => ({
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
        type,
        animated,
        markerEnd,
        style,
        label,
      }));

      console.log('Serialized blocks:', JSON.stringify(serializedNodes, null, 2));
      console.log('Serialized edges:', JSON.stringify(serializedEdges, null, 2));

      saveFlowchart(sanitizedProjectName, blocks, edges);
      setSavedProjects(getSavedProjects());
      setProjectName('');
      setIsDropdownOpen(false);
      toast.success(`Flowchart "${sanitizedProjectName}" saved successfully.`);
    } catch (error) {
      console.error('Error saving flowchart:', error);
      toast.error('Failed to save the flowchart. Please try again.');
    }
  };

  const handleLoadFlowchart = (name) => {
    try {
      const loadedData = loadFlowchart(name);
      if (loadedData) {
        setNodes(loadedData.blocks);
        setEdges(loadedData.edges);
        setIsDropdownOpen(false);
        toast.success(`Flowchart "${name}" loaded successfully.`);
      } else {
        toast.error('Failed to load the selected project.');
      }
    } catch (error) {
      console.error('Error loading flowchart:', error);
      toast.error('An error occurred while loading the flowchart.');
    }
  };

  const handleDeleteProject = (name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        deleteProject(name);
        setSavedProjects(getSavedProjects());
        toast.success(`Flowchart "${name}" deleted successfully.`);
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete the project. Please try again.');
      }
    }
  };

  const handleClearFlowchart = () => {
    if (window.confirm('Are you sure you want to start a new project? Unsaved changes will be lost.')) {
      setNodes([]);
      setEdges([]);
      toast.info('Started a new project.');
    }
  };

  return (
    <nav className="navbar">
      {/* Left Section: Logo and Hint Button */}
      <div className="navbar-section navbar-left">
        <h2 className="navbar-title">A Lego-like Programming</h2>
        <button onClick={() => setShowHint(true)} className="hint-button" title="Show block guide">
          <FaLightbulb /> Guide
        </button>
      </div>

      {/* Center Section: Save and New Project */}
      <div className="navbar-section navbar-center">
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
      </div>

      {/* Right Section: Saved Projects Dropdown */}
      <div className="navbar-section navbar-right">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="dropdown-button"
        >
          Saved Projects <FaFolderOpen />
        </button>
        {isDropdownOpen && (
          <ul className="project-dropdown">
            {savedProjects.length === 0 ? (
              <li>No saved projects.</li>
            ) : (
              savedProjects.map((name) => (
                <li key={name}>
                  <span>{name}</span>
                  <div className="project-actions">
                    <button
                      onClick={() => handleLoadFlowchart(name)}
                      className="load-button"
                      title="Load Project"
                    >
                      <FaFolderOpen />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(name)}
                      className="delete-button"
                      title="Delete Project"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {/* Modal for the Guide */}
      {showHint && (
        <div className="hint-modal-overlay">
          <div className="hint-modal-content">
            <h3>Block Guide</h3>
            <ul>
              <li><strong>Start:</strong> Marks the beginning of your program.</li>
              <li><strong>End:</strong> Marks the end of your program.</li>
              <li><strong>If:</strong> Represents a conditional decision point.</li>
              <li><strong>While:</strong> Executes a loop while a condition is true.</li>
              <li><strong>Print:</strong> Outputs a message or variable to the console.</li>
              <li><strong>Set Variable:</strong> Initializes a variable with a value.</li>
              <li><strong>Change Variable:</strong> Modifies an existing variable.</li>
              <li><strong>Dummy:</strong> A placeholder block that can be replaced.</li>
            </ul>
            <button onClick={() => setShowHint(false)} className="hint-close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;