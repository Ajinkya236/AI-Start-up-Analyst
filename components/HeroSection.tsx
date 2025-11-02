import React from 'react';
import { ArrowRightIcon } from './icons/Icons';

interface HeroSectionProps {
  onAnalyze: () => void;
  onRegister: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onAnalyze, onRegister }) => {
  return (
    <section className="text-center py-24 md:py-32">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text mb-4 text-sm font-semibold tracking-wider">
        THE FUTURE OF VENTURE CAPITAL ANALYSIS
      </div>
      <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white tracking-tighter">
        AI-Powered Diligence, <br/> Human-Led Decisions.
      </h1>
      <p className="max-w-3xl mx-auto text-lg md:text-xl text-[rgba(255,255,255,0.8)] mb-10">
        Automate 70% of manual memo drafting and analysis. Go from data chaos to investment clarity in minutes, empowering you to focus on what truly matters.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onAnalyze}
          className="flex items-center justify-center gap-3 w-full sm:w-auto text-base font-semibold bg-white text-black px-8 py-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
        >
          Analyze Startups (For VCs) <ArrowRightIcon className="text-black" />
        </button>
        <button
          onClick={onRegister}
          className="flex items-center justify-center gap-3 w-full sm:w-auto text-base font-semibold bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl hover:bg-white hover:text-black transition-all duration-300"
        >
          Register Your Company
        </button>
      </div>


      <div className="relative mt-24 max-w-5xl mx-auto">
         <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-2xl"></div>
        <div className="relative bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 shadow-2xl">
            <img src="https://picsum.photos/seed/venture/1200/600" alt="Dashboard preview" className="rounded-lg w-full h-auto" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;