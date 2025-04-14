// src/Components/CharacterDisplay.js

import React from 'react';
import Character from '../Character/Character';

function CharacterDisplay({ characterMessage, characterPosition, rotation }) {
  return (
    <div className="character-area">
      <Character 
        message={characterMessage} 
        position={characterPosition} 
        rotation={rotation}
      />
    </div>
  );
}

export default CharacterDisplay;