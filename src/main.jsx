// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importa o Router
import App from './App.jsx';
import OutraPagina from './OutraPagina.jsx'; // Importa o componente para a outra página
import { SessionProvider } from './SessionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/outra-pagina" element={<OutraPagina />} />
        </Routes>
      </Router>
    </SessionProvider>
  </React.StrictMode>
);
