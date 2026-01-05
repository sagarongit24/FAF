// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import CSS in correct order - CRITICAL!
import './styles/base.css';       // FIRST - Variables & foundation
import './styles/components.css'; // SECOND - Reusable components
import './styles/pages.css';      // THIRD - Page-specific layouts

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);