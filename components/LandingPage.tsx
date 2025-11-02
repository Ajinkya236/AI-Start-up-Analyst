import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import SocialProofSection from './SocialProofSection';
import FaqSection from './FaqSection';
import FinalCtaSection from './FinalCtaSection';

interface LandingPageProps {
  onAnalyze: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, onRegister }) => {
  return (
    <div className="overflow-x-hidden">
      <Header onAnalyze={onAnalyze} onRegister={onRegister} />
      <main className="container mx-auto px-6 md:px-8">
        <HeroSection onAnalyze={onAnalyze} onRegister={onRegister} />
        <BenefitsSection />
        <SocialProofSection />
        <FaqSection />
        <FinalCtaSection onAnalyze={onAnalyze} />
      </main>
    </div>
  );
};

export default LandingPage;