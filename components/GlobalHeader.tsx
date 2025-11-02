
import React from 'react';

interface GlobalHeaderProps {
  onNavigateHome: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="sticky top-0 z-50 bg-[rgba(15,20,25,0.7)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.1)]">
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <button onClick={onNavigateHome} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 transition-opacity hover:opacity-80">
          VentureAnalytica AI
        </button>
      </div>
    </header>
  );
};

export default GlobalHeader;
