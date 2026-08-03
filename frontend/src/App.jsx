import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

import { Toaster } from 'react-hot-toast';

/**
 * Root Application Bootstrapper
 * Wraps routes in AuthProvider and BrowserRouter
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
