
import React from 'react';

const SocialProofSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Trusted by Top-Tier VCs</h2>
        <p className="mt-4 text-lg text-[rgba(255,255,255,0.7)]">Leading investors use VentureAnalytica AI to get a competitive edge.</p>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="w-full max-w-md bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-lg">
          <p className="text-lg italic text-[rgba(255,255,255,0.9)] mb-6">"This platform has fundamentally changed our diligence process. We're making faster, more informed decisions and can cover significantly more ground without sacrificing quality."</p>
          <div className="flex items-center">
            <img src="https://picsum.photos/seed/person/50/50" alt="Jane Doe" className="w-12 h-12 rounded-full mr-4 border-2 border-[rgba(255,255,255,0.2)]" />
            <div>
              <p className="font-bold text-white">Jane Doe</p>
              <p className="text-sm text-[rgba(255,255,255,0.7)]">Principal, Future Ventures</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16">
        <p className="text-center text-sm font-semibold text-[rgba(255,255,255,0.6)] uppercase tracking-wider mb-6">AS SEEN AT</p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            <span className="text-2xl font-bold text-gray-400 opacity-70">Innovate Capital</span>
            <span className="text-2xl font-bold text-gray-400 opacity-70">NextGen Ventures</span>
            <span className="text-2xl font-bold text-gray-400 opacity-70">Apex Partners</span>
            <span className="text-2xl font-bold text-gray-400 opacity-70">Quantum Growth</span>
            <span className="text-2xl font-bold text-gray-400 opacity-70">StellarCap</span>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
