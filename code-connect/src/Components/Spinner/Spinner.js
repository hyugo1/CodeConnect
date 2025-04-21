// src/Components/Spinner/Spinner.js
import React from 'react';

export default function Spinner() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'
    }}>
      <div className="loader">Loading…</div>
      {/* You can replace the above with any spinner you like */}
    </div>
  );
}