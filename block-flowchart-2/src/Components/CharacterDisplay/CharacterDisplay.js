// src/Components/CharacterDisplay.js

import React from 'react';
import Character from '../Character/Character';

function CharacterDisplay({ characterMessage, characterPosition }) {
  return (
    <div className="character-area">
      <Character message={characterMessage} position={characterPosition} />
    </div>
  );
}

export default CharacterDisplay;