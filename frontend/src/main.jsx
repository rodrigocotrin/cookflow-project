// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router.jsx';
import { AuthProvider } from './context/AuthContexto.jsx';
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
    <Router />
    </AuthProvider>
  </React.StrictMode>,
);