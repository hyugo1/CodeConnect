import React, { useState } from 'react';
import CharacterDisplay from '../CharacterDisplay/CharacterDisplay';
import CodePreview from '../CodePreview';
import Console from '../Console/Console';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './RightPanel.css';

const RightPanel = ({ characterMessage, characterPosition, blocks, edges, consoleOutput }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`right-panel ${collapsed ? 'collapsed' : ''}`}>
      {/* Toggle button to collapse/expand the panel */}
      <button 
        className="collapse-button"
        onClick={() => setCollapsed(!collapsed)}
        title="Toggle Right Panel"
      >
        {collapsed ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Render content only if not collapsed */}
      {!collapsed && (
        <>
          <CharacterDisplay
            characterMessage={characterMessage}
            characterPosition={characterPosition}
          />
          <CodePreview blocks={blocks} edges={edges} />
          <Console consoleOutput={consoleOutput} />
        </>
      )}
    </div>
  );
};

export default RightPanel;