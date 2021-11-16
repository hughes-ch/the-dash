import './App.css';
import React, { useState } from 'react';

function App() {
  let [content, setContent] = useState('Click Me!');

  let fetchContent = async () => {
    setContent('Loading...');

    const url = `/sites`;
    const response = await fetch(url);
    const parsedJson = await response.json();

    setContent(parsedJson.message);
  };
  
  return (
    <div className="App">
      <button onClick={ fetchContent }>
        { content }
      </button>
    </div>
  );
}

export default App;
