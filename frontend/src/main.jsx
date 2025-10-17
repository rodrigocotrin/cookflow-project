// Arquivo: src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router.jsx';
import { AuthProvider } from './context/AuthContexto.jsx';
import { HelmetProvider } from 'react-helmet-async'; // 1. Importar
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider> {/* 2. Envolver toda a aplicação */}
      <AuthProvider>
        <Router />
      </AuthProvider>
    </HelmetProvider> {/* 3. Fechar o provider */}
  </React.StrictMode>,
);