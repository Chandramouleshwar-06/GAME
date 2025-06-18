import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Make sure this path is correct if you moved index.css
import App from './App'; // Import the main App component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);