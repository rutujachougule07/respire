import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WebsiteContentProvider } from './context/WebsiteContentContext';
import App from './App.jsx';
import './firebase.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WebsiteContentProvider>
          <App />
        </WebsiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
