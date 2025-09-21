
import React from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import SocialProofSection from './SocialProofSection';
import FaqSection from './FaqSection';
import FinalCtaSection from './FinalCtaSection';

interface LandingPageProps {
  onAnalyze: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze }) => {
  return (
    <div className="overflow-x-hidden">
      <Header onAnalyze={onAnalyze} />
      <main className="container mx-auto px-6 md:px-8">
        <HeroSection onAnalyze={onAnalyze} />
        <BenefitsSection />
        <SocialProofSection />
        <FaqSection />
        <FinalCtaSection onAnalyze={onAnalyze} />
      </main>
    </div>
  );
};

export default LandingPage;
