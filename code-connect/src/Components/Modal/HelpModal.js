// src/Components/Modal/HelpModal.js

import React from 'react';
import './HelpModal.css';

const HelpModal = ({ visible, helpText, onClose, title }) => {
  if (!visible) return null;

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="help-modal-title">{title}</h3>}
        <p className="help-modal-body">{helpText}</p>
        <button className="help-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default HelpModal;