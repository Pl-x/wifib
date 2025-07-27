import React from 'react';
import { useData } from '../context/DataContext';
import { Wifi, CheckCircle } from 'lucide-react'; // Removed WifiOff and XCircle

function BackendStatus() {
  const { backendConnected } = useData();

  // Only render if backend is connected
  if (!backendConnected) {
    return null; // Render nothing if backend is not connected
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg bg-green-100 text-green-800 border border-green-200">
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Backend Connected</span>
          <CheckCircle className="w-4 h-4" />
        </>
      </div>
    </div>
  );
}

export default BackendStatus;
