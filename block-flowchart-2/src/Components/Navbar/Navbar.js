// src/Components/Navbar/Navbar.js

import React, { useState, useEffect } from 'react';
import {
  saveFlowchart,
  loadFlowchart,
  getSavedProjects,
  deleteProject,
} from '../../utils/storage';
import './Navbar.css';
import { FaFolderOpen, FaTrash } from 'react-icons/fa'; // Import icons for better UI
import { toast } from 'react-toastify'; // Import toast for notifications

const Navbar = ({ nodes, edges, setNodes, setEdges }) => {
  const [projectName, setProjectName] = useState('');
  const [savedProjects, setSavedProjects] = useState(getSavedProjects());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Refresh saved projects when component mounts
  useEffect(() => {
    const projects = getSavedProjects();
    console.log('Navbar useEffect - updated saved projects:', projects);
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
        if (
          !window.confirm(
            `A project named "${sanitizedProjectName}" already exists. Do you want to overwrite it?`
          )
        ) {
          return;
        }
      }

      // **Log the nodes and edges being saved**
      console.log('Current nodes before saving:', JSON.stringify(nodes, null, 2));
      console.log('Current edges before saving:', JSON.stringify(edges, null, 2));

      // **Ensure serialization is correct**
      const serializedNodes = nodes.map(({ id, type, position, data }) => ({
        id,
        type,
        position,
        data,
      }));
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

      // **Optionally, verify serialized data**
      console.log('Serialized nodes:', JSON.stringify(serializedNodes, null, 2));
      console.log('Serialized edges:', JSON.stringify(serializedEdges, null, 2));

      saveFlowchart(sanitizedProjectName, nodes, edges);
      setSavedProjects(getSavedProjects());
      setProjectName('');
      setIsDropdownOpen(false);
      toast.success(`Flowchart "${sanitizedProjectName}" saved successfully.`);
      console.log(`Project "${sanitizedProjectName}" saved.`);
    } catch (error) {
      console.error('Error saving flowchart:', error);
      toast.error('Failed to save the flowchart. Please try again.');
    }
  };

  const handleLoadFlowchart = (name) => {
    console.log(`Attempting to load project "${name}".`);
    try {
      const loadedData = loadFlowchart(name);
      if (loadedData) {
        console.log('Loaded data:', JSON.stringify(loadedData, null, 2));
        setNodes(loadedData.nodes);
        setEdges(loadedData.edges);
        setIsDropdownOpen(false);
        toast.success(`Flowchart "${name}" loaded successfully.`);
        console.log(`Project "${name}" loaded with nodes:`, loadedData.nodes, 'and edges:', loadedData.edges);
      } else {
        toast.error('Failed to load the selected project.');
        console.warn(`Failed to load project "${name}".`);
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
        console.log(`Project "${name}" deleted.`);
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
      console.log('Flowchart cleared for a new project.');
    }
  };

  return (
    <nav className="navbar">
      <h2>Lego Like Programming</h2>
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
    </nav>
  );
};

export default Navbar;