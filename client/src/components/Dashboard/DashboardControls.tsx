// client/src/pages/Dashboard/DashboardControls.tsx
import type { ChangeEvent } from 'react';
import { Search, Trash2, RotateCw, XCircle } from 'lucide-react';

interface DashboardControlsProps {
  selectedIdsCount: number;
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDeleteSelected: () => void;
  onStopSelected: () => void;
  onRerunSelected: () => void;
  disableControls: boolean;
  canStopSelected: boolean; // New prop to control stop button state
  isDeleting?: boolean;
  isStopping?: boolean;
  isRerunning?: boolean;
}

export default function DashboardControls({
  selectedIdsCount,
  searchTerm,
  onSearchChange,
  onDeleteSelected,
  onStopSelected,
  onRerunSelected,
  disableControls,
  canStopSelected,
  isDeleting = false,
  isStopping = false,
  isRerunning = false,
}: DashboardControlsProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={onDeleteSelected}
            disabled={selectedIdsCount === 0 || disableControls}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isDeleting ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {isDeleting ? 'Deleting...' : `Delete (${selectedIdsCount})`}
          </button>
          <button
            onClick={onStopSelected}
            disabled={selectedIdsCount === 0 || disableControls || !canStopSelected}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-500 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isStopping ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            {isStopping ? 'Stopping...' : `Stop (${selectedIdsCount})`}
          </button>
          <button
            onClick={onRerunSelected}
            disabled={selectedIdsCount === 0 || disableControls}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isRerunning ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <RotateCw className="mr-2 h-4 w-4" />
            )}
            {isRerunning ? 'Re-running...' : `Re-run (${selectedIdsCount})`}
          </button>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search analyses..."
              value={searchTerm}
              onChange={onSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={disableControls}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
