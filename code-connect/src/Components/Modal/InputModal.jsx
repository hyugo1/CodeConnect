import React, { useState, useEffect } from 'react';
import AccessibleModal from './AccessibleModal';
import './InputModal.css';

export default function InputModal({
  open,
  promptText,
  onSubmit,
  onCancel,
}) {
  const [value, setValue] = useState('');

  // clear when reopened
  useEffect(() => {
    if (open) setValue('');
  }, [open]);

  if (!open) return null;

  return (
    <AccessibleModal
      onClose={onCancel}
      title=""
      showCloseButton={false}
      hideDefaultFooter={true}
    >
      <div className="input-modal-body">
        <p className="input-modal-prompt">{promptText}</p>
        <input
          type="text"
          className="input-modal-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Type here..."
        />
      </div>

      <footer className="input-modal-footer">
        <button
          onClick={() => onSubmit(value)}
          className="btn submit-btn"
        >
          OK
        </button>
      </footer>
    </AccessibleModal>
  );
}