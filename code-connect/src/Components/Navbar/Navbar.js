// src/Components/Navbar/Navbar.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { auth, db, googleProvider } from '../../config/firebase';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  deleteUser
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
import AccessibleModal from '../Modal/AccessibleModal';
import './Navbar.css';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LoginIcon from '@mui/icons-material/Login';

const Navbar = ({ blocks, edges, setNodes, setEdges }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [signinDropdownOpen, setsigninDropdownOpen] = useState(false);
   // types: 'save', 'load', 'signup', 'signin', 'forgotPassword', 'guide', 'settings', 'examples'
  const [modal, setModal] = useState({ type: null });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projectName, setProjectName] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  const defaultExamples = [
    {
      id: 'hello-world',
      name: 'Hello World',
      description: 'A simple flowchart that outputs "Hello World".',
      url: '/examples/hello_world.json'
    },
    {
      id: 'if-then-example',
      name: 'If Then Condition',
      description: 'A simple flowchart that has the usage of if then blocks.',
      url: '/examples/if_then.json'
    },
    {
      id: 'whileloop-example',
      name: 'While Example',
      description: 'An example showing a while loop with conditional execution.',
      url: '/examples/while.json'
    },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Show guide modal on first load
  useEffect(() => {
    if (!localStorage.getItem('guideModalShown')) {
      setModal({ type: 'guide' });
      localStorage.setItem('guideModalShown', 'true');
    }
  }, []);

  const getUserProjects = useCallback(async () => {
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
        console.error('Could not load your projects:', error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      getUserProjects();
    } else {
      setMyProjects([]);
    }
  }, [currentUser, getUserProjects]);

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
      toast.success('Your project has been saved as a file.');
      setModal({ type: null });
      setProjectName('');
    } catch (error) {
      console.error('Saving failed:', error);
      toast.error('Could not save your project as a file.');
    }
  };

  const handleSaveAsDatabase = async () => {
    if (!projectName.trim()) {
      toast.error('Please give your project a fun name!');
      return;
    }
    if (!currentUser) {
      toast.error('You need to be signed in to save your project.');
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
      toast.success('Your project is saved in your account.');
      setModal({ type: null });
      setProjectName('');
      getUserProjects();
    } catch (error) {
      console.error('Saving to account failed:', error);
      toast.error('Could not save your project to your account.');
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
        toast.success('Your project was loaded.');
        setModal({ type: null });
      } catch (error) {
        console.error('Loading failed:', error);
        toast.error('Could not load the project: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadProject = (project) => {
    try {
      const importedData = importFlowchart(project.project_details);
      setNodes(importedData.blocks);
      setEdges(importedData.edges);
      toast.success(`Project "${project.project_name}" is loaded.`);
      setModal({ type: null });
    } catch (error) {
      console.error('Loading project failed:', error);
      toast.error('Could not load your project.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await deleteDoc(projectDoc);
      toast.success('Project deleted.');
      getUserProjects();
    } catch (error) {
      console.error('Deleting project failed:', error);
      toast.error('Could not delete your project.');
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
      toast.error('Could not create your account: ' + error.message);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('You’re signed in with Google.');
    } catch (error) {
      console.error('Google sign in failed:', error);
      toast.error('Google sign in didn’t work.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('You have signed out.');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Could not sign you out.');
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
      toast.error('Sign in didn’t work: ' + error.message);
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
      toast.error('Could not send the reset email: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      return;
    }
    try {
      await deleteUser(auth.currentUser);
      toast.success("Your account has been deleted.");
    } catch (error) {
      console.error("Account deletion failed:", error);
      toast.error("Could not delete your account.");
    }
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    toast.success("Dark mode toggled.");
  };

  const handleLoadExample = async (example) => {
    try {
      const response = await fetch(example.url);
      if (!response.ok) {
        throw new Error('Failed to load example.');
      }
      const json = await response.text();
      const importedData = importFlowchart(json);
      setNodes(importedData.blocks);
      setEdges(importedData.edges);
      toast.success(`Example "${example.name}" loaded.`);
      setModal({ type: null });
    } catch (error) {
      console.error('Error loading example:', error);
      toast.error('Could not load the example: ' + error.message);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-brand">
            <img
              src="logo.png"
              alt="Code Connect Logo"
              className="navbar-logo"
            />
            <span className="navbar-title">Code Connect!</span>
          </a>
          <div className="navbar-menu">
            <ul className="navbar-menu-list">
              <li>
                <button
                  onClick={() => setModal({ type: 'guide' })}
                  className="navbar-menu-item"
                >
                  <InfoIcon style={{ marginRight: '0.5rem' }} />
                  HOW TO PLAY
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal({ type: 'save' })}
                  className="navbar-menu-item"
                >
                  <SaveIcon style={{ marginRight: '0.5rem' }} />
                  SAVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal({ type: 'load' })}
                  className="navbar-menu-item"
                >
                  <FolderOpenIcon style={{ marginRight: '0.5rem' }} />
                  OPEN
                </button>
              </li>
              <li>
                <button
                  onClick={() => setModal({ type: 'examples' })}
                  className="navbar-menu-item"
                >
                  <LibraryBooksIcon style={{ marginRight: '0.5rem' }} />
                  EXAMPLES
                </button>
              </li>
            </ul>
          </div>
          {/* Authentication Section */}
          <div className="navbar-auth">
            {currentUser ? (
              <div className="user-menu-container">
                <button
                  className="user-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User menu"
                >
                  <img
                    src={currentUser?.photoURL ? currentUser.photoURL : 'profile_pic.png'}
                    alt="User avatar"
                    referrerPolicy={currentUser?.photoURL ? "no-referrer" : undefined}
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
                          onClick={() => setModal({ type: 'settings' })}
                          className="dropdown-item"
                        >
                          <AccountCircleIcon style={{ marginRight: '0.5rem' }} />
                          Settings
                        </button>
                      </li>
                      <li>
                        <button onClick={handleSignOut} className="dropdown-item">
                          <LoginIcon style={{ marginRight: '0.5rem' }} />
                          Sign Out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="signin-menu-container" style={{ position: 'relative' }}>
                <button
                  className="btn signin-btn"
                  onClick={() => setsigninDropdownOpen(!signinDropdownOpen)}
                >
                  <LoginIcon style={{ marginRight: '0.5rem' }} />
                  SIGN IN
                </button>
                {signinDropdownOpen && (
                  <div className="signin-dropdown">
                    <button
                      className="signin-dropdown-item"
                      onClick={() => {
                        setModal({ type: 'signin' });
                        setsigninDropdownOpen(false);
                      }}
                    >
                      <LoginIcon style={{ marginRight: '0.5rem' }} />
                      Sign In with Email
                    </button>
                    <button
                      className="signin-dropdown-item"
                      onClick={() => {
                        handleSignInWithGoogle();
                        setsigninDropdownOpen(false);
                      }}
                    >
                      <LoginIcon style={{ marginRight: '0.5rem' }} />
                      Sign In with Google
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Dark mode toggle */}
            <button
              className="btn darkmode-btn-custom"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              <DarkModeIcon />
            </button>
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
        <AccessibleModal onClose={() => setModal({ type: null })} title="SAVE YOUR PROJECT">
          <input
            type="text"
            placeholder="Enter a project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="modal-input"
          />
          <div className="modal-button-group">
            <button onClick={handleSaveAsJSON} className="btn modal-btn file-btn">
              <SaveIcon style={{ marginRight: '0.5rem' }} />
              Save to Your Computer
            </button>
            <button onClick={handleSaveAsDatabase} className="btn modal-btn account-btn">
              <SaveIcon style={{ marginRight: '0.5rem' }} />
              Save to Your Account
            </button>
          </div>
        </AccessibleModal>
      )}

      {/* Load Modal */}
      {modal.type === 'load' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="OPEN A PROJECT">
          <div className="modal-section">
            <button
              onClick={() => fileInputRef.current.click()}
              className="btn modal-btn import-btn"
            >
              <FolderOpenIcon style={{ marginRight: '0.5rem' }} />
              IMPORT
            </button>
          </div>
          {currentUser ? (
            <>
              <h4 className="modal-subtitle">YOUR PROJECTS</h4>
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
                          <FolderOpenIcon style={{ marginRight: '0.5rem' }} />
                          Load
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="btn project-delete-btn"
                        >
                          <DeleteIcon style={{ marginRight: '0.5rem' }} />
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
            <p className="no-projects">Sign in to see your projects.</p>
          )}
        </AccessibleModal>
      )}

      {/* Examples Modal */}
      {modal.type === 'examples' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="EXAMPLES">
          <ul className="example-list">
            {defaultExamples.map((example) => (
              <li key={example.id} className="example-list-item">
                <h4 className="example-with-icon">
                  <LibraryBooksIcon style={{ marginRight: '0.5rem' }} />
                  {example.name}
                </h4>
                <p>{example.description}</p>
                <button onClick={() => handleLoadExample(example)} className="btn modal-btn load-example-btn">
                  <FolderOpenIcon style={{ marginRight: '0.5rem' }}/>
                  Load Example
                </button>
              </li>
            ))}
          </ul>
        </AccessibleModal>
      )}

      {/* Sign Up Modal */}
      {modal.type === 'signup' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="CREATE ACCOUNT">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
          />
          <button onClick={handleSignUp} className="btn modal-btn signup-btn">
            <LoginIcon style={{ marginRight: '0.5rem' }} />
            Join Now
          </button>
        </AccessibleModal>
      )}

      {modal.type === 'signin' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="SIGN IN">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="modal-input"
          />
          {/* Use the updated modal-button-group to fix the positions of these three buttons */}
          <div className="modal-button-group">
            <button onClick={handleSignIn} className="btn signin-btn-custom modal-btn">
              <LoginIcon style={{ marginRight: '0.5rem' }} />
              Sign In
            </button>
            <button
              onClick={() => setModal({ type: 'forgotPassword' })}
              className="btn forgot-btn modal-btn"
            >
              <LoginIcon style={{ marginRight: '0.5rem' }} />
              Forgot Password?
            </button>
            <button
              onClick={() => setModal({ type: 'signup' })}
              className="btn newuser-btn modal-btn"
            >
              <LoginIcon style={{ marginRight: '0.5rem' }} />
              New here?
            </button>
          </div>
        </AccessibleModal>
      )}

      {/* Forgot Password Modal */}
      {modal.type === 'forgotPassword' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="Reset Your Password">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="modal-input"
          />
          <button onClick={handleForgotPassword} className="btn forgot-btn modal-btn">
            <LoginIcon style={{ marginRight: '0.5rem' }} />
            Send Reset Email
          </button>
        </AccessibleModal>
      )}

      {/* Guide Modal */}
      {modal.type === 'guide' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="How to Play Code Connect" customClass="hint-modal">
          <ul className="hint-list">
            <li>Code Connect is a visual programming language website.</li>
            <li>
              <strong>Connecting Blocks:</strong> Drag blocks from the block palette and connect them by clicking on their connection points.
            </li>
            <li>
              <strong>Creating a Flow:</strong> Start with a <em>Start</em> block, then add other blocks like <em>Set Variable</em>, <em>If Then</em>, and <em>Print</em>.
              Connect them in sequence to build your program.
            </li>
            <li>
              <strong>Hints on Each Block:</strong> Click the hint (question mark) button on a block to see detailed instructions on how it works.
            </li>
            <li>
              <strong>Try It Out:</strong> Experiment by connecting blocks in different orders to see how the flow changes your program’s behavior.
            </li>
            <li>
              <strong>Have Fun!</strong> This is your chance to be creative and learn by doing. Don't worry if you make mistakes; each block teaches you a new concept.
            </li>
          </ul>
          <p className="hint-footer">
            Press the "HOW TO PLAY" button anytime to review these hints and learn more about what each block does.
          </p>
        </AccessibleModal>
      )}

      {/* Settings Modal */}
      {modal.type === 'settings' && (
        <AccessibleModal 
          onClose={() => setModal({ type: null })} 
          title={
            // <>
            //   <AccountCircleIcon style={{ marginRight: '0.5rem' }} className="account-settings-title" /> Account Settings
            // </>
            <>Account Settings</>
          }
        >
          <div className="settings-section">
            <h4 className="delete-account-title">Delete Account</h4>
            <button onClick={handleDeleteAccount} className="btn modal-btn delete-btn animated-btn">
              <DeleteIcon style={{ marginRight: '0.5rem' }} />
              Delete Account
            </button>
          </div>
          <div className="settings-section">
            <h4 className="theme-title">Theme</h4>
            <button onClick={toggleDarkMode} className="btn modal-btn animated-btn darkmode-btn-custom">
              <DarkModeIcon style={{ marginRight: '0.5rem' }} />
              Dark Mode
            </button>
          </div>
        </AccessibleModal>
      )}
    </>
  );
};

export default Navbar;