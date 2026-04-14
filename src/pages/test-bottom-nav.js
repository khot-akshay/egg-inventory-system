import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import { useBottomNav } from '../hooks/useBottomNav';

export default function TestBottomNav() {
  const { isVisible, toggleBottomNav } = useBottomNav();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Bottom Navigation Test</h1>
        
        <button
          onClick={toggleBottomNav}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
        >
          {isVisible ? 'Hide' : 'Show'} Bottom Nav
        </button>

        <div className="bg-white p-4 rounded shadow">
          <p className="mb-2">Current window width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px</p>
          <p className="mb-2">Bottom Nav Visible: {isVisible ? 'Yes' : 'No'}</p>
          <p>Resize browser to mobile view (less than or equal to 768px) to see bottom navigation</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Instructions:</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click the button above to toggle bottom nav visibility</li>
              <li>Resize browser window to mobile width (<= 768px)</li>
              <li>Bottom navigation should appear at bottom of screen</li>
              <li>Test navigation by clicking menu items</li>
            </ol>
          </div>
        </div>
      </div>

      <BottomNav isVisible={isVisible} />
      
      {/* Add padding to prevent content overlap */}
      <div className="pb-16 md:pb-0"></div>
    </div>
  );
}
