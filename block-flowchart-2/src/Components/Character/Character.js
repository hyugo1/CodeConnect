// src/Components/Character/Character.js

import React from 'react';
import './Character.css'; // We'll create this CSS file for styling

const Character = ({ message }) => {
  return (
    <div className="character-container">
      {message && (
        <div className="message-bubble">
          <p>{message}</p>
        </div>
      )}
      <img
        // src={`${process.env.PUBLIC_URL}/character.png`}
        src={`${process.env.PUBLIC_URL}/orange.jpg`} 
        // src={`../../public/orange.jpg`} 
        alt="Character"
        className="character-image"
      />
    </div>
  );
};

export default Character;