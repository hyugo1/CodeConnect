// src/Components/Navbar/Navbar.js

import React, { useState, useEffect, useRef } from 'react';
import { auth, db, googleProvider } from '../../config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
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
import { toast } from 'react-toastify';
import './Navbar.css';
import defaultProfilePic from '../../images/profile_pic.png';

const Navbar = ({ blocks, edges, setNodes, setEdges }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modal, setModal] = useState({ type: null }); // types: 'save', 'load', 'signup', 'signin', 'forgotPassword', 'guide'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projectName, setProjectName] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  // Listen for user sign-in/out
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Auto-show the guide modal once for new users.
  useEffect(() => {
    if (!localStorage.getItem('guideModalShown')) {
      setModal({ type: 'guide' });
      localStorage.setItem('guideModalShown', 'true');
    }
  }, []);

  const getUserProjects = async () => {
    if (currentUser) {
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', currentUser.uid)
        );
        const data = await getDocs(projectsQuery);
        const projects = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMyProjects(projects);
      } catch (error) {
        console.error('Oops, couldn’t load your projects:', error);
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
      toast.error('Please give your project a fun name!');
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
      toast.success('Hooray! Your project has been saved as a file.');
      setModal({ type: null });
      setProjectName('');
    } catch (error) {
      console.error('Uh-oh, saving failed:', error);
      toast.error('Oops! Could not save your project as a file.');
    }
  };

  const handleSaveAsDatabase = async () => {
    if (!projectName.trim()) {
      toast.error('Please give your project a fun name!');
      return;
    }
    if (!currentUser) {
      toast.error('You need to be logged in to save your project.');
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
      toast.success('Great! Your project is saved in your account.');
      setModal({ type: null });
      setProjectName('');
      getUserProjects();
    } catch (error) {
      console.error('Saving to account failed:', error);
      toast.error('Oops! Could not save your project to your account.');
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
        toast.success('Yay! Your project was loaded.');
        setModal({ type: null });
      } catch (error) {
        console.error('Uh-oh, loading failed:', error);
        toast.error('Oops! Could not load the project: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadProject = (project) => {
    try {
      const importedData = importFlowchart(project.project_details);
      setNodes(importedData.blocks);
      setEdges(importedData.edges);
      toast.success(`Awesome! Project "${project.project_name}" is loaded.`);
      setModal({ type: null });
    } catch (error) {
      console.error('Loading project failed:', error);
      toast.error('Oops! Could not load your project.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await deleteDoc(projectDoc);
      toast.success('Project deleted. Bye bye!');
      getUserProjects();
    } catch (error) {
      console.error('Deleting project failed:', error);
      toast.error('Oops! Could not delete your project.');
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('Welcome aboard! Your account is ready.');
      setModal({ type: null });
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Account creation failed:', error);
      toast.error('Oops! Could not create your account: ' + error.message);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Hi there! You’re signed in with Google.');
    } catch (error) {
      console.error('Google sign in failed:', error);
      toast.error('Oops! Google sign in didn’t work.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('You have signed out. See you soon!');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Oops! Could not sign you out.');
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      toast.error('Please fill in your email and password.');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back! You’re signed in.');
      setModal({ type: null });
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Sign in failed:', error);
      toast.error('Oops! Sign in didn’t work: ' + error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Please type your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('A reset email has been sent. Check your inbox!');
      setModal({ type: null });
    } catch (error) {
      console.error('Resetting password failed:', error);
      toast.error('Oops! Could not send the reset email: ' + error.message);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Brand */}
          <a href="/" className="navbar-brand">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              alt="Logo"
              className="navbar-logo"
            />
            <span className="navbar-title">Block Coding Fun!</span>
          </a>

          {/* Mobile Menu Toggle */}
          {/* <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="mobile-menu-icon"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button> */}

          {/* Navigation Links */}
          <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <ul className="navbar-menu-list">
              <li>
                <button
                  onClick={() => setModal({ type: 'guide' })}
                  className="navbar-menu-item"
                >
                  How to Play
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal({ type: 'save' })}
                  className="navbar-menu-item"
                >
                  Save Your Project
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal({ type: 'load' })}
                  className="navbar-menu-item"
                >
                  Open a Project
                </button>
              </li>
            </ul>
          </div>

          {/* Authentication */}
          <div className="navbar-auth">
            {currentUser ? (
              <div className="user-menu-container">
                <button
                  className="user-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  {/* Display the user's profile image or a default image */}
                  <img
                    src={currentUser?.photoURL || defaultProfilePic}
                    alt="User"
                    className="user-avatar"
                  />
                </button>
                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <span className="dropdown-email">{currentUser.email}</span>
                    </div>
                    <ul className="dropdown-menu">
                      <li>
                        <button
                          onClick={handleSignOut}
                          className="dropdown-item"
                        >
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  className="btn login-btn"
                  onClick={() => setModal({ type: 'signin' })}
                >
                  Log In
                </button>
                <button
                  className="btn login-btn"
                  onClick={handleSignInWithGoogle}
                >
                  Log In with Google
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hidden file input for importing */}
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        className="hidden-file-input"
        onChange={handleImportFlowchart}
        style={{ display: 'none' }}
      />

      {/* Save Modal */}
      {modal.type === 'save' && (
        <Modal onClose={() => setModal({ type: null })} title="Save Your Project">
          <input
            type="text"
            placeholder="Enter a fun project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="modal-input"
          />
          <div className="modal-button-group">
            <button onClick={handleSaveAsJSON} className="btn modal-btn file-btn">
              Save to Your Computer
            </button>
            <button onClick={handleSaveAsDatabase} className="btn modal-btn account-btn">
              Save to Your Account
            </button>
          </div>
          <button onClick={() => setModal({ type: null })} className="btn modal-btn cancel-btn">
            Cancel
          </button>
        </Modal>
      )}

      {/* Load Modal */}
      {modal.type === 'load' && (
        <Modal onClose={() => setModal({ type: null })} title="Open a Project">
          <div className="modal-section">
            <button
              onClick={() => fileInputRef.current.click()}
              className="btn modal-btn import-btn"
            >
              Import from Your Computer
            </button>
          </div>
          {currentUser ? (
            <>
              <h4 className="modal-subtitle">Your Projects</h4>
              {myProjects.length ? (
                <ul className="project-list">
                  {myProjects.map((project) => (
                    <li key={project.id} className="project-list-item">
                      <span>{project.project_name}</span>
                      <div className="project-actions">
                        <button
                          onClick={() => handleLoadProject(project)}
                          className="btn project-load-btn"
                        >
                          Open
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="btn project-delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-projects">No projects yet. Start one!</p>
              )}
            </>
          ) : (
            <p className="no-projects">
              Log in to see your projects.
            </p>
          )}
          <button onClick={() => setModal({ type: null })} className="btn modal-btn cancel-btn">
            Close
          </button>
        </Modal>
      )}

      {/* Sign Up Modal */}
      {modal.type === 'signup' && (
        <Modal onClose={() => setModal({ type: null })} title="Create an Account">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
          />
          <button onClick={handleSignUp} className="btn modal-btn signup-btn">
            Join Now
          </button>
          <button onClick={() => setModal({ type: null })} className="btn modal-btn cancel-btn">
            Cancel
          </button>
        </Modal>
      )}

      {/* Sign In Modal */}
      {modal.type === 'signin' && (
        <Modal onClose={() => setModal({ type: null })} title="Log In">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
          />
          <button onClick={handleSignIn} className="btn modal-btn signin-btn">
            Log In
          </button>
          <button
            onClick={() => setModal({ type: 'forgotPassword' })}
            className="btn modal-btn forgot-btn"
          >
            Forgot Password?
          </button>
          <button
            onClick={() => setModal({ type: 'signup' })}
            className="btn modal-btn newuser-btn"
          >
            New here?
          </button>
          <button onClick={() => setModal({ type: null })} className="btn modal-btn cancel-btn">
            Cancel
          </button>
        </Modal>
      )}

      {/* Forgot Password Modal */}
      {modal.type === 'forgotPassword' && (
        <Modal onClose={() => setModal({ type: null })} title="Reset Your Password">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <button onClick={handleForgotPassword} className="btn modal-btn forgot-btn">
            Send Reset Email
          </button>
          <button onClick={() => setModal({ type: null })} className="btn modal-btn cancel-btn">
            Cancel
          </button>
        </Modal>
      )}

      {/* Guide Modal */}
      {modal.type === 'guide' && (
        <Modal onClose={() => setModal({ type: null })} title="How to Play with Blocks" customClass="hint-modal">
          <ul className="hint-list">
            <li><strong>Start:</strong> This is where your adventure begins!</li>
            <li><strong>End:</strong> This marks the end of your story.</li>
            <li><strong>If Then:</strong> Make choices and see what happens.</li>
            <li><strong>While:</strong> Repeat actions until you’re done.</li>
            <li><strong>Print:</strong> Show messages on the screen.</li>
            <li><strong>Set Variable:</strong> Create a new item (variable).</li>
            <li><strong>Change Variable:</strong> Update your item.</li>
            <li><strong>Move:</strong> Help your character go on an adventure.</li>
            <li><strong>Dummy:</strong> Replace this block with a real one when you're ready.</li>
          </ul>
          <button onClick={() => setModal({ type: null })} className="btn modal-btn cancel-btn">
            Close
          </button>
        </Modal>
      )}
    </>
  );
};

const Modal = ({ onClose, title, children, customClass }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-content ${customClass || ''}`} onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
};

export default Navbar;