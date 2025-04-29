# Code Connect

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen)](https://third-year-project-be34c.web.app)  

Most compatible with Google Chrome: https://third-year-project-be34c.web.app

Code Connect is a browser-based visual programming environment for beginners. Build “flowcharts” by dragging and connecting blocks, then execute step-by-step with animations, followed with console outputs and an animated character. Save or export your projects for later.

**Code Connect** differentiates itself from other block-based tools through:  
1. **Enhanced Control Flow** — enforced true/false branches, join-blocks, and color-coded edges.  
2. **Predefined Block Structure** — a minimal, task-specific palette that reduces cognitive load.

---

## 📋 Table of Contents

1. [🌟 Features](#-features)  
2. [🛠️ Tech Stack](#️-tech-stack)  
3. [💾 Installation & Local Development](#-installation--local-development)  
4. [⚙️ Configuration](#️-configuration)  
5. [🚀 Available Scripts](#-available-scripts)  
6. [📦 Deployment](#-deployment)  
7. [🤝 Contributing](#-contributing)  
8. [📄 License](#-license)

---

## 🌟 Features

- **Visual Flowchart Editor**  
  Drag & drop blocks (Start, If, While, Variables, I/O, Move, Rotate, etc.) on a React Flow canvas, connect them, and see a live mini-map with zoom/pan controls.

- **Enhanced Control Flow**  
  Every `If` and `While` block auto-creates true/false placeholders and explicit join-blocks; edges are color-coded (green for true, red for false).

- **Immediate Execution Feedback**  
  Click **Run** to traverse your flowchart with DFS:  
  – Active blocks & edges highlight  
  – Console output streams line-by-line  
  – On-screen character moves, rotates, and “speaks” messages

- **Persistent Storage**  
  - **Local** via `localStorage` for quick saves without signup  
  - **Cloud** via Firebase Auth & Firestore (email/password or Google sign-in)

- **Export / Import JSON**  
  Serialize your diagram to JSON (positions, types, data) for offline backup or sharing.

- **Undo / Redo & Resizable Panels**  
  Edit history powered by `use-undo`; adjustable palette, canvas, and inspector widths with drag handles.

- **Theming & Accessibility**  
  Light/dark mode toggle, ARIA labels, keyboard navigation, and WCAG 2.1 AA contrast compliance.

- **Code Generation**  
  Generate equivalent JavaScript code from your flowchart via a visitor-based DFS code generator.

---

## 🛠️ Tech Stack

- **Framework**: React 18.x (Create React App)  
- **Diagramming**: React Flow  
- **Styling**: CSS Modules + CSS Variables, Material UI (+ Emotion)  
- **Icons**: Material UI Icons, React-Icons (Font Awesome)  
- **State & Logic**: React Context, custom hooks (`useFlowchartExecutor`, `useFlowchartHandlers`, etc.)  
- **Persistence**: Firebase Auth, Firestore, `localStorage`  
- **Evaluation**: mathjs for safe expression parsing  
- **Utilities**: uuid, use-undo, react-split, html2canvas, react-hot-toast  
- **Testing**: Jest, React Testing Library, @testing-library/jest-dom  
- **Lint / Format**: ESLint, Prettier  
- **Hosting**: Firebase Hosting (global CDN, SSL)

---

## 💾 Installation & Local Development

1. **Clone the repo**  
   ```bash
   git clone https://github.com/yourusername/code-connect.git
   cd code-connect
2.	**Install dependencies:**
  - npm install or yarn
4.	**Create a Firebase project:**
   - Enable Authentication (Email/Password & Google)
	 - Create a Firestore database in test mode
6.	**Copy .env.example → .env and fill in your Firebase config:**
  - REACT_APP_FIREBASE_API_KEY=your-api-key
  - REACT_APP_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
  - REACT_APP_FIREBASE_PROJECT_ID=your-app
  - REACT_APP_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
  - REACT_APP_FIREBASE_MESSAGING_SENDER_ID=sender-id
  - REACT_APP_FIREBASE_APP_ID=app-id

7.	**Run locally**:
 - npm start or yarn start, Visit http://localhost:3000.

⚙️ **Configuration**
- All environment variables are prefixed with REACT_APP_.

🚀 **Available Scripts**
- npm start           # start dev server
- npm test            # run unit & integration tests
- npm run build       # production build (minified & tree-shaken)
- npm run lint        # ESLint code linting
- npm run format      # Prettier code formatting
- npm run serve       # serve `build/` locally for testing

📦 **Deployment**
Continuous Deployment is configured via Firebase Hosting:
- npm run build
- firebase deploy
