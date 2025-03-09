// src/Components/Navbar/Navbar.js

import React, { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider } from '../../config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from 'firebase/firestore';
import { exportFlowchart, importFlowchart } from '../../utils/storage';
import { FaFileExport, FaFileImport, FaLightbulb, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = ({ blocks, edges, setNodes, setEdges }) => {
  const [showHint, setShowHint] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const fileInputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const getUserProjects = async () => {
    if (currentUser) {
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', currentUser.uid)
        );
        const data = await getDocs(projectsQuery);
        const projects = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setMyProjects(projects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
  };

  useEffect(() => {
    if (currentUser) {
      getUserProjects();
    } else {
      setMyProjects([]);
    }
  }, [currentUser]);

  const handleSaveAsJSON = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name.');
      return;
    }
    try {
      const json = exportFlowchart(blocks, edges);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName.trim()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Project exported as JSON.');
      setShowSaveModal(false);
      setProjectName('');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export project.');
    }
  };

  const handleSaveAsDatabase = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name.');
      return;
    }
    if (!currentUser) {
      toast.error('You must be signed in to save to the database.');
      return;
    }
    try {
      const projectJson = exportFlowchart(blocks, edges);
      await addDoc(collection(db, 'projects'), {
        project_name: projectName.trim(),
        userId: currentUser.uid,
        project_details: projectJson,
        savedAt: new Date().toISOString(),
      });
      toast.success('Project saved to Database.');
      setShowSaveModal(false);
      setProjectName('');
      getUserProjects();
    } catch (error) {
      console.error('Database save error:', error);
      toast.error('Failed to save project to Database.');
    }
  };

  const handleImportFlowchart = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const importedData = importFlowchart(evt.target.result);
        setNodes(importedData.blocks);
        setEdges(importedData.edges);
        toast.success('Project imported successfully.');
        setShowLoadModal(false);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import project: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadProject = (project) => {
    try {
      const importedData = importFlowchart(project.project_details);
      setNodes(importedData.blocks);
      setEdges(importedData.edges);
      toast.success(`Project "${project.project_name}" loaded.`);
      setShowLoadModal(false);
    } catch (error) {
      console.error('Load error:', error);
      toast.error('Failed to load project.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await deleteDoc(projectDoc);
      toast.success('Project deleted.');
      getUserProjects();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project.');
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Sign up successful.');
      setShowSignUpModal(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error(error);
      toast.error('Sign Up failed: ' + error.message);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Google Sign In successful.');
    } catch (error) {
      console.error(error);
      toast.error('Google Sign In failed: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully.');
    } catch (error) {
      console.error(error);
      toast.error('Sign Out failed: ' + error.message);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-section navbar-left">
        <h2 className="navbar-title">A Lego-like Visual Programming</h2>
        <button
          onClick={() => setShowHint(true)}
          className="hint-button"
          title="Show block guide"
        >
          <FaLightbulb /> Guide
        </button>
      </div>
      <div className="navbar-section navbar-center">
        <button onClick={() => setShowSaveModal(true)} className="save-button" title="Save Project">
          Save
        </button>
        <button onClick={() => setShowLoadModal(true)} className="load-button" title="Load Project">
          Load
        </button>
      </div>
      <div className="navbar-section navbar-right">
        {currentUser ? (
          <>
            <div className="auth-status">
              <FaUser /> {currentUser.email}
            </div>
            <button onClick={handleSignOut} className="auth-action-button" title="Sign Out">
              Sign Out
            </button>
          </>
        ) : (
          <div className="auth-buttons">
            <button onClick={() => setShowSignUpModal(true)} className="auth-action-button">
              Sign Up
            </button>
            <button onClick={handleSignInWithGoogle} className="auth-action-button">
              Sign In with Google
            </button>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImportFlowchart}
      />
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Save Project</h3>
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <div className="save-options">
              <button onClick={handleSaveAsJSON} className="modal-button">
                Save as JSON
              </button>
              <button onClick={handleSaveAsDatabase} className="modal-button">
                Save to Database
              </button>
            </div>
            <button onClick={() => setShowSaveModal(false)} className="modal-button cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Load Project</h3>
            <div className="load-options">
              <button onClick={() => fileInputRef.current.click()} className="modal-button">
                Import JSON
              </button>
            </div>
            {currentUser ? (
              <>
                <h4>Your Projects</h4>
                {myProjects.length ? (
                  <ul className="project-list">
                    {myProjects.map((project) => (
                      <li key={project.id}>
                        <span>{project.project_name}</span>
                        <button onClick={() => handleLoadProject(project)} className="modal-button small">
                          Load
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="modal-button small">
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No projects found.</p>
                )}
              </>
            ) : (
              <p>Please sign in to load projects from the database.</p>
            )}
            <button onClick={() => setShowLoadModal(false)} className="modal-button cancel">
              Close
            </button>
          </div>
        </div>
      )}
      {showSignUpModal && (
        <div className="modal-overlay" onClick={() => setShowSignUpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sign Up</h3>
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleSignUp} className="modal-button">
              Sign Up
            </button>
            <button onClick={() => setShowSignUpModal(false)} className="modal-button cancel">
              Cancel
            </button>
          </div>
        </div>
      )}
      {showHint && (
        <div className="hint-modal-overlay">
          <div className="hint-modal-content">
            <h3>Block Guide</h3>
            <ul>
              <li>
                <strong>Start:</strong> Marks the beginning of your program.
              </li>
              <li>
                <strong>End:</strong> Marks the end of your program.
              </li>
              <li>
                <strong>If Then:</strong> Create decisions.
              </li>
              <li>
                <strong>While:</strong> Create loops.
              </li>
              <li>
                <strong>Print:</strong> Output messages.
              </li>
              <li>
                <strong>Set Variable:</strong> Create a new variable.
              </li>
              <li>
                <strong>Change Variable:</strong> Update a variable.
              </li>
              <li>
                <strong>Move:</strong> Move your character.
              </li>
              <li>
                <strong>Dummy:</strong> Replace with a real block.
              </li>
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