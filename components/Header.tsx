import React from 'react';
import { ArrowRightIcon } from './icons/Icons';

interface HeaderProps {
  onAnalyze: () => void;
  onRegister: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAnalyze, onRegister }) => {
  return (
    <header className="sticky top-0 z-50 bg-[rgba(15,20,25,0.7)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.1)]">
      <div className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          VentureAnalytica AI
        </h1>
        <div className="hidden md:flex items-center gap-4">
           <button
            onClick={onRegister}
            className="text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            For Founders
          </button>
          <button
            onClick={onAnalyze}
            className="flex items-center gap-2 text-sm font-semibold bg-[rgba(255,255,255,0.15)] backdrop-blur-lg border border-[rgba(255,255,255,0.2)] text-white px-5 py-2.5 rounded-xl hover:bg-[rgba(255,255,255,0.25)] transition-all duration-300 transform hover:scale-105"
          >
            Analyst Login <ArrowRightIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;