import './App.css';
import React, { useState } from 'react';

function App() {
  let [content, setContent] = useState('Click Me!');

  let fetchContent = async () => {
    setContent('Loading...');
    
    const host = window.location.protocol + '//' + window.location.host;
    const url = `${host}/sites`;
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
