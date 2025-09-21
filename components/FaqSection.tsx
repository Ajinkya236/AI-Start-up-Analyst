
import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from './icons/Icons';

const faqs = [
  {
    question: "Will AI replace my judgment as an investor?",
    answer: "Absolutely not. Our platform is designed to augment your expertise, not replace it. The AI handles the repetitive, time-consuming data collection and synthesis, freeing you up to focus on strategic analysis, founder relationships, and the nuanced insights that only a human can provide. You are always in control of the final decision.",
  },
  {
    question: "How accurate is the AI-generated data?",
    answer: "We prioritize transparency and verifiability. Our Data Ingestion Agent assigns confidence scores to all data points and provides direct links to the original sources. This allows you to trust the information while still being able to verify any critical data points before making a final investment decision.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, data security is our top priority. All uploaded documents and generated memos are encrypted both in transit and at rest. We use industry-standard security protocols to ensure your proprietary information remains confidential and protected.",
  },
  {
    question: "Can I customize the analysis and memo structure?",
    answer: "Yes. The platform allows you to edit preferences and adjust the weightages for different sections of the investment memo, such as Founder Profile, Market Sizing, and Differentiation. This ensures the AI's output is tailored to your firm's specific evaluation criteria and priorities.",
  },
];

interface FaqItemProps {
    faq: { question: string, answer: string };
}

const FaqItem: React.FC<FaqItemProps> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[rgba(255,255,255,0.12)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-6"
      >
        <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
        <div className="text-[rgba(255,255,255,0.7)]">
          {isOpen ? <MinusIcon /> : <PlusIcon />}
        </div>
      </button>
      {isOpen && (
        <div className="pb-6 pr-8">
          <p className="text-[rgba(255,255,255,0.8)]">{faq.answer}</p>
        </div>
      )}
    </div>
  );
};


const FaqSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">Frequently Asked Questions</h2>
        <p className="mt-4 text-lg text-[rgba(255,255,255,0.7)]">Addressing your concerns about AI in venture capital.</p>
      </div>
      <div className="max-w-3xl mx-auto bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 md:p-8">
        {faqs.map((faq, index) => (
          <FaqItem key={index} faq={faq} />
        ))}
      </div>
    </section>
  );
};

export default FaqSection;
