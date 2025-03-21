// src/Components/Character/Character.js

import React from 'react';
  import './Character.css';

  const Character = ({ message, position }) => {
    const { x, y } = position;

    return (
      <div
        className="character-container"
        style={{
          transform: `translate(${x}px, ${y}px)`,
          transition: 'transform 0.5s ease',
        }}
      >
        {message && (
          <div className="message-bubble">
            <p>{message}</p>
          </div>
        )}
        <img
          src={`${process.env.PUBLIC_URL}/orange_blob.png`}
          alt="Character"
          className="character-image"
        />
      </div>
    );
  };

  export default Character;