import React from 'react';
import { useData } from '../context/DataContext';
import { Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';

function BackendStatus() {
  const { backendConnected} = useData();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        backendConnected 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        {backendConnected ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Backend Connected</span>
            <CheckCircle className="w-4 h-4" />
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Backend Offline</span>
            <XCircle className="w-4 h-4" />
          </>
        )}
      </div>
    </div>
  );
}

export default BackendStatus; 