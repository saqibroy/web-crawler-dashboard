// App.js
import { useEffect } from 'react';
import { getAuthToken } from './services/api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard'; // Your main dashboard component
import Analysis from './pages/Analysis'; // Your nested detail page
import { Toaster } from 'react-hot-toast';

function App() {
  useEffect(() => {
    getAuthToken().catch(console.error);
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        {/* Application-wide Header - Clean white background with subtle shadow */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              {/* Dashboard Title / Branding */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Web Crawler Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Analyze and monitor website crawl results with ease
                </p>
              </div>
              {/* No navigation or user actions needed in header */}
            </div>
          </div>
        </header>

        {/* Main content area - Very light background for content separation */}
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis/:id" element={<Analysis />} />
            </Routes>
          </div>
        </main>

        {/* Application-wide Footer - Slightly darker than header for grounding */}
        <footer className="bg-gray-100 border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Web Crawler. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Designed for powerful web insights.
            </p>
          </div>
        </footer>
      </BrowserRouter>
    </>
  );
}

export default App;