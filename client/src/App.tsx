import { useEffect } from 'react';
import { getAuthToken } from './services/api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AnalysisDetail from './pages/AnalysisDetail';

function App() {
  useEffect(() => {
    // Get token on app load
    getAuthToken().catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analysis/:id" element={<AnalysisDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 