import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { logApiConfig } from './utils/api';
import CacheManager from './utils/cacheManager';
import { FileRegistryProvider } from './contexts/FileRegistryContext';
import packageJson from '../package.json';

function App() {
  useEffect(() => {
    // Check cache version and clear if needed
    const checkCache = async () => {
      const needsReload = await CacheManager.checkAndClearCache(packageJson.version);
      if (needsReload) {
        // Small delay to ensure cache is cleared
        setTimeout(() => {
          CacheManager.forceHardReload();
        }, 100);
      }
    };

    checkCache();

    // Log API configuration on app startup (only in debug mode)
    logApiConfig();
  }, []);

  return (
    <FileRegistryProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <Layout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/create" element={<Dashboard />} />
            <Route path="/dashboard/home" element={<Dashboard />} />
            <Route path="/dashboard/project/:id" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </FileRegistryProvider>
  );
}

export default App;