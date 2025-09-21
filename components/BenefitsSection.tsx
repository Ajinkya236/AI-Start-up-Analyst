
import React from 'react';
import { ZapIcon, ScaleIcon, SaveIcon } from './icons/Icons';

const benefits = [
  {
    icon: <SaveIcon />,
    title: 'Automated Memo Drafting',
    description: 'Saves associates over 70% of manual effort by auto-generating comprehensive investment memos from raw data.',
  },
  {
    icon: <ZapIcon />,
    title: 'Deep Research Agent',
    description: 'Instantly uncover critical insights from public and private data sources, from market trends to competitor analysis.',
  },
  {
    icon: <ScaleIcon />,
    title: 'Scale Your Evaluations',
    description: 'Standardize your investment criteria with customizable scoring and weighting to ensure consistent, high-quality deal flow analysis.',
  },
];

const BenefitsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Go from Raw Data to Actionable Insights</h2>
        <p className="mt-4 text-lg text-[rgba(255,255,255,0.7)]">Our AI agents do the heavy lifting, so you can focus on strategy.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-lg transition-transform duration-300 hover:transform hover:-translate-y-2"
          >
            <div className="mb-4 inline-block p-3 bg-[rgba(255,255,255,0.1)] rounded-lg">
              {benefit.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
            <p className="text-[rgba(255,255,255,0.8)]">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;
