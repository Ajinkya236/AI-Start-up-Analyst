
import React from 'react';
import { ArrowRightIcon } from './icons/Icons';

interface FinalCtaSectionProps {
  onAnalyze: () => void;
}

const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onAnalyze }) => {
  return (
    <section className="py-24 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Supercharge Your Diligence?
        </h2>
        <p className="text-lg text-[rgba(255,255,255,0.8)] mb-10">
          Stop drowning in data. Start making smarter, faster investment decisions today.
        </p>
        <button
          onClick={onAnalyze}
          className="flex items-center gap-3 mx-auto text-base font-semibold bg-white text-black px-8 py-4 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
        >
          Analyze Startups <ArrowRightIcon className="text-black" />
        </button>
      </div>
    </section>
  );
};

export default FinalCtaSection;
