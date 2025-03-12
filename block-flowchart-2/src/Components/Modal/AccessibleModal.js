// src/Components/Modal/AccessibleModal.js
import React, { useEffect, useRef } from 'react';

const AccessibleModal = ({ onClose, title, children, customClass }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    // if (modalRef.current) {
    //   modalRef.current.focus();
    // }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`modal-content ${customClass || ''}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
      >
        <h3 id="modal-title" className="modal-title">
          {title}
        </h3>
        {children}
        <button
          onClick={onClose}
          className="btn modal-btn cancel-btn"
          aria-label="Close modal"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AccessibleModal;