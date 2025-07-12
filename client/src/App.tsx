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
      {/* Application-wide Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Web Crawler Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Analyze and monitor website crawl results
            </p>
          </div>
        </div>
      </header>

      {/* Main content area, where specific pages will be rendered */}
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis/:id" element={<AnalysisDetail />} />
          </Routes>
        </div>
      </main>

      {/* Application-wide Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm">&copy; {new Date().getFullYear()} Web Crawler. All rights reserved.</p>
        </div>
      </footer>
    </BrowserRouter>
  );
}

export default App;