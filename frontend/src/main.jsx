// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router.jsx'; // Importa nosso novo roteador
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router /> {/* Renderiza o roteador em vez do App */}
  </React.StrictMode>,
);