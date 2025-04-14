// src/Components/Character/Character.js
import React from 'react';
  import './Character.css';

  const Character = ({ message, position, rotation }) => {
    const { x, y } = position;
    const z = rotation;

    return (
      <div
        className="character-container"
        style={{
          transform: `translate(${x}px, ${y}px) rotate(${z}deg)`,
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