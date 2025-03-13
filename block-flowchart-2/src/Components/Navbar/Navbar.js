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
  updateProfile,
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
import defaultProfilePic from '../../images/profile_pic.png';
import { FaUser, FaTrash, FaMoon } from 'react-icons/fa';

const Navbar = ({ blocks, edges, setNodes, setEdges }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [modal, setModal] = useState({ type: null }); // types: 'save', 'load', 'signup', 'signin', 'forgotPassword', 'guide', 'settings', 'examples'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [projectName, setProjectName] = useState('');
  const [myProjects, setMyProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const fileInputRef = useRef(null);

  // Default examples available to all users.
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
      url: '/examples/if_condition.json'
    },
    {
      id: 'whileloop-example',
      name: 'While Example',
      description: 'An example showing a while loop with conditional execution.',
      url: '/examples/while.json'
    },
    // Add more examples as needed.
  ];

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
        console.error('Could not load your projects:', error);
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

  // Function to load a default example from a JSON file in your repo
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
          {/* Brand */}
          <a href="/" className="navbar-brand">
            <img
              // src="https://flowbite.com/docs/images/logo.svg"
              src="logo.png"
              alt="Flowchart Logo"
              className="navbar-logo"
            />
            <span className="navbar-title">Code Connect!</span>
          </a>
          {/* Navigation Links */}
          <div className="navbar-menu">
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
              <li>
                <button
                  onClick={() => setModal({ type: 'examples' })}
                  className="navbar-menu-item"
                >
                  Examples
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
                    src={currentUser?.photoURL || defaultProfilePic}
                    alt="User avatar"
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
                          Settings
                        </button>
                      </li>
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
        <AccessibleModal onClose={() => setModal({ type: null })} title="Save Your Project">
          <input
            type="text"
            placeholder="Enter a project name"
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
        </AccessibleModal>
      )}

      {/* Load Modal */}
      {modal.type === 'load' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="Open a Project">
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
        </AccessibleModal>
      )}

      {/* Examples Modal */}
      {modal.type === 'examples' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="Examples">
          <ul className="example-list">
            {defaultExamples.map((example) => (
              <li key={example.id} className="example-list-item">
                <h4>{example.name}</h4>
                <p>{example.description}</p>
                <button onClick={() => handleLoadExample(example)} className="btn modal-btn">
                  Load Example
                </button>
              </li>
            ))}
          </ul>
        </AccessibleModal>
      )}

      {/* Sign Up Modal */}
      {modal.type === 'signup' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="Create an Account">
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
            Join Now
          </button>
        </AccessibleModal>
      )}

      {/* Sign In Modal */}
      {modal.type === 'signin' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="Log In">
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
          <div className="modal-button-group">
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
          <button onClick={handleForgotPassword} className="btn modal-btn forgot-btn">
            Send Reset Email
          </button>
        </AccessibleModal>
      )}

      {/* Guide Modal */}
      {modal.type === 'guide' && (
        <AccessibleModal onClose={() => setModal({ type: null })} title="How to Play with Blocks" customClass="hint-modal">
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
            Press the "How to Play" button anytime to review these hints and learn more about what each block does.
          </p>
        </AccessibleModal>
      )}

      {/* Settings Modal */}
      {modal.type === 'settings' && (
        <AccessibleModal 
          onClose={() => setModal({ type: null })} 
          title={
            <>
              <FaUser className="modal-icon" /> Account Settings
            </>
          }
        >
          <div className="settings-section">
            <h4>Delete Account</h4>
            <button onClick={handleDeleteAccount} className="btn modal-btn delete-btn animated-btn">
              <FaTrash className="icon" /> Delete Account
            </button>
          </div>
          <div className="settings-section">
            <h4>Theme</h4>
            <button onClick={toggleDarkMode} className="btn modal-btn animated-btn">
              <FaMoon className="icon" /> Dark Mode
            </button>
          </div>
        </AccessibleModal>
      )}
    </>
  );
};

export default Navbar;