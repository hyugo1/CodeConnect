// src/Components/Character/Character.js
import React from 'react';
  import './Character.css';

  const Character = ({ message, position, rotation }) => {
    return (
      <div
        className="character-container"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
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
          width={48}
          height={48}
        />
      </div>
    );
  };

  export default Character;