'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Drawer({ isOpen, onClose, title, children }) {
  // Prevent scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        <header className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-navy-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </header>
        
        <div className="flex-grow overflow-y-auto no-scrollbar p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
