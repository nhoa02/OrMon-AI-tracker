
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Auth from './views/Auth';

/**
 * LEARNING NOTE: El componente Root maneja la autenticación y el tema inicial.
 * Bypass: Si 'BYPASS_LOGIN' es true, forzamos un usuario en localStorage.
 */
const Root = () => {
  const BYPASS_LOGIN = true; 

  const [user, setUser] = useState<string | null>(localStorage.getItem('temp_user'));

  useEffect(() => {
    // Si queremos saltar el login, guardamos un nombre por defecto
    if (BYPASS_LOGIN && !user) {
      const mockUser = "Marta";
      localStorage.setItem('temp_user', mockUser);
      setUser(mockUser);
    }

    // Inicializar el tema desde localStorage al cargar
    const savedState = localStorage.getItem('hormonaflow_pro_v1');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [BYPASS_LOGIN, user]);

  if (!user && !BYPASS_LOGIN) {
    return <Auth />;
  }

  return <App />;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}
