import React, { useEffect, useState } from 'react'
import { parseHtmlSanitizeAddTargetToLinks } from '../utils/util2'
import html from './content.html';

function Test() {

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://gtlcdnstorage.blob.core.windows.net/guide/stylesheets/guide.css"; // Ensure correct path
    link.id = "external-css";

    if (!document.getElementById("external-css")) {
      document.head.appendChild(link);
    }

    return () => {
      document.getElementById("external-css")?.remove(); // Cleanup on unmount
    };

  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [foundContent, setFoundContent] = useState('')


  function handleSearchChange(e) {
      setSearchTerm(e.target.value);
  }

  return (
    <div className='App'>
      <header className='App-header'>
      <input type="text" value={searchTerm} onChange={handleSearchChange} />

        {parseHtmlSanitizeAddTargetToLinks(html, searchTerm)}
      </header>
    </div>
  )
}

export default Test;
