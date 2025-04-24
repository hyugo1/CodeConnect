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
       <picture>
          <source
            srcSet={`${process.env.PUBLIC_URL}/orange_blob.webp`}
            type="image/webp"
          />
          <img
            src={`${process.env.PUBLIC_URL}/orange_blob.png`}
            alt="Character"
            className="character-image"
          />
        </picture>
      </div>
    );
  };

  export default Character;