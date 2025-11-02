import React, { useState } from 'react';
import { DataSource } from '../../App';

interface Step3PsychometricTestProps {
    onComplete: (assessment: DataSource) => void;
    onPrevious: () => void;
}

const testQuestions = [
    {
        question: "When faced with a major setback, your first reaction is to:",
        options: ["Analyze what went wrong to prevent it in the future.", "Rally the team to find an immediate solution.", "Seek advice from mentors and advisors.", "Take a step back to reassess the overall strategy."],
        trait: "Resilience & Problem-Solving"
    },
    {
        question: "You have a strong vision for your product, but key market feedback suggests a different direction. You:",
        options: ["Stick to your vision, believing the market will catch up.", "Conduct more research to validate the feedback before making changes.", "Pivot the product roadmap to align with the feedback.", "Try to find a compromise that incorporates feedback without losing the core vision."],
        trait: "Adaptability & Vision"
    },
    {
        question: "When hiring a key team member, what do you prioritize most?",
        options: ["Raw talent and potential, even if they lack experience.", "Deep domain expertise and a proven track record.", "Cultural fit and alignment with the company's mission.", "A strong work ethic and ability to execute quickly."],
        trait: "Team Building & Leadership"
    },
    {
        question: "How do you approach risk?",
        options: ["Avoid it whenever possible; stability is key.", "Take calculated risks where the potential reward outweighs the downside.", "Embrace high-risk, high-reward opportunities.", "Systematically de-risk every aspect of the business before scaling."],
        trait: "Risk Tolerance"
    },
    {
        question: "Your company is running low on cash. You:",
        options: ["Immediately start an aggressive fundraising process.", "Cut costs drastically to extend the runway, even if it slows growth.", "Focus all efforts on generating short-term revenue.", "Transparently communicate the situation to the team to brainstorm solutions."],
        trait: "Financial Management & Transparency"
    },
    {
        question: "A key employee wants to leave for a competitor. You:",
        options: ["Wish them well and immediately start a search for their replacement.", "Make a competitive counter-offer to convince them to stay.", "Conduct an exit interview to understand their reasons for leaving.", "Assess the impact on the team and communicate a plan to mitigate it."],
        trait: "Leadership & Retention"
    },
    {
        question: "You receive harsh, negative feedback from an early customer. You:",
        options: ["Question the validity of the feedback.", "Thank them and ask detailed follow-up questions to understand the root cause.", "Apologize and offer a discount or refund.", "Compare their feedback with other users' experiences before acting."],
        trait: "Customer Focus & Humility"
    },
    {
        question: "A new technology emerges that could disrupt your entire industry. You:",
        options: ["Wait to see how it develops and how competitors react.", "Assign a small team to research and experiment with the new technology.", "Double down on your current technology to build a stronger moat.", "Begin exploring ways to integrate the new technology into your product."],
        trait: "Strategic Foresight"
    },
    {
        question: "You have two equally promising strategic paths, but only resources for one. How do you decide?",
        options: ["Choose the path that aligns best with the original company vision.", "Build a financial model to compare the potential ROI of each path.", "Consult with your team and advisors to get their perspectives.", "Run small, cheap experiments for both paths to see which gets more traction."],
        trait: "Decision Making"
    },
    {
        question: "How do you prefer to celebrate team wins?",
        options: ["With public recognition in a company-wide meeting.", "With financial bonuses or stock options.", "With a team-building event or offsite.", "By immediately setting the next ambitious goal."],
        trait: "Culture & Motivation"
    },
    {
        question: "A potential investor strongly disagrees with your core business model but is willing to invest if you change it. You:",
        options: ["Politely decline the investment to protect your vision.", "Consider the change if the investor has a strong track record in your industry.", "Ask for the data and reasoning behind their suggestion for further evaluation.", "Seek other investors who are aligned with your current model."],
        trait: "Conviction & Coachability"
    },
    {
        question: "Which of these best describes your biggest personal weakness as a founder?",
        options: ["I can be too focused on product details and lose sight of the bigger picture.", "I sometimes struggle with delegating important tasks.", "I can be overly optimistic in financial and timeline projections.", "I find it difficult to deliver critical feedback to my team."],
        trait: "Self-Awareness"
    },
    {
        question: "How do you personally stay updated with market trends?",
        options: ["Reading industry news, blogs, and reports daily.", "Networking with other founders, investors, and experts.", "Attending conferences and industry events.", "Analyzing competitor products and strategies."],
        trait: "Continuous Learning"
    },
    {
        question: "When pitching your company, the most important thing to convey is:",
        options: ["The massive size of the market opportunity.", "The unique, defensible technology you've built.", "The incredible team you've assembled.", "The compelling story of why your company must exist."],
        trait: "Sales & Communication"
    },
    {
        question: "You realize a core feature you spent months building isn't being used by customers. You:",
        options: ["Launch a marketing campaign to educate users on the feature's benefits.", "Interview users to understand why they aren't using it.", "Remove the feature to reduce product complexity.", "Deprioritize the feature but leave it in, in case it becomes useful later."],
        trait: "Product Sense"
    },
    {
        question: "How do you handle disagreements with your co-founder(s)?",
        options: ["We debate until we reach a consensus, no matter how long it takes.", "We rely on data and experiments to prove which approach is better.", "We defer to the person with the most expertise in that specific area.", "If we're at a stalemate, one person has the final say (CEO or designated tie-breaker)."],
        trait: "Conflict Resolution"
    },
    {
        question: "The best way to motivate your team during a tough period is:",
        options: ["By showing unwavering optimism and confidence in the future.", "By being transparent about the challenges and showing a clear plan forward.", "By offering incentives for hitting short-term recovery goals.", "By reminding them of the company's mission and long-term vision."],
        trait: "Leadership in Crisis"
    },
    {
        question: "You are presented with an early, but modest, acquisition offer. You:",
        options: ["Reject it immediately as it undervalues your long-term potential.", "Seriously consider it as a way to de-risk the outcome for the team and early investors.", "Use the offer as leverage in your current fundraising round.", "Evaluate it against a clear set of criteria for what a 'good' exit looks like for you."],
        trait: "Strategic Thinking"
    },
    {
        question: "Describe your ideal relationship with your investors.",
        options: ["They provide capital and stay out of the day-to-day operations.", "They act as a formal board member for governance and accountability.", "They are active partners who I can call for advice and introductions.", "They are deeply embedded in our strategy and operations."],
        trait: "Investor Relations"
    },
    {
        question: "When do you know it's the right time to stop pursuing an idea and move on?",
        options: ["When the team's morale is consistently low.", "When the data clearly shows a lack of product-market fit after multiple iterations.", "When the company is about to run out of money.", "When you personally lose passion for the problem you're solving."],
        trait: "Grit vs. Stubbornness"
    }
];

const Step3PsychometricTest: React.FC<Step3PsychometricTestProps> = ({ onComplete, onPrevious }) => {
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const isComplete = Object.keys(answers).length === testQuestions.length;

    const handleSubmit = () => {
        if (!isComplete) return;

        const summary = `
# Founder Behavioural Assessment Results (Simulated)

This report provides a qualitative analysis based on the founder's responses to a psychometric questionnaire.

## Key Traits Analysis:

- **Resilience & Problem-Solving:** The founder's response suggests a ${Math.random() > 0.5 ? 'proactive and analytical' : 'collaborative and solution-oriented'} approach to challenges. They appear capable of navigating setbacks effectively.

- **Adaptability & Vision:** The assessment indicates a ${Math.random() > 0.5 ? 'strong commitment to their core vision while remaining open' : 'data-driven and flexible approach'} to market feedback. This balance is crucial for product-market fit.

- **Team Building & Leadership:** The founder prioritizes ${answers[2].toLowerCase().includes('cultural fit') ? 'cultural alignment and team cohesion' : 'talent and execution ability'}, suggesting a clear philosophy on building a high-performing team.

- **Risk Tolerance:** The founder demonstrates a ${answers[3].toLowerCase().includes('calculated') ? 'balanced and strategic' : 'cautious and methodical'} approach to risk, which is vital for sustainable growth.

- **Financial Management & Transparency:** The response indicates a ${answers[4].toLowerCase().includes('transparently') ? 'transparent and team-oriented' : 'pragmatic and decisive'} style in managing financial pressures.

## Overall Summary:
The founder exhibits key psychological traits associated with successful entrepreneurs, including strong problem-solving skills, adaptability, and a clear leadership style. Further diligence is recommended, but this initial assessment is positive.
`;

        onComplete({
            id: `assessment-${Date.now()}`,
            type: 'assessment',
            content: summary,
            filename: 'Founder Psychometric Assessment',
            status: 'Completed',
            isSelected: true
        });
    };

    return (
        <div className="max-w-3xl mx-auto bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-2">Step 3: Behavioural Assessment</h2>
            <p className="text-gray-400 mb-6">There are no right or wrong answers. Please select the option that best describes you.</p>

            <div className="space-y-8">
                {testQuestions.map((q, index) => (
                    <div key={index}>
                        <h3 className="font-semibold text-white mb-3">{index + 1}. {q.question}</h3>
                        <div className="space-y-2">
                            {q.options.map(option => (
                                <label key={option} className="flex items-center p-3 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={option}
                                        checked={answers[index] === option}
                                        onChange={() => handleAnswerChange(index, option)}
                                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-3 text-gray-300">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

             <div className="mt-8 flex justify-between">
                <button onClick={onPrevious} className="px-6 py-2.5 font-semibold text-white bg-white/10 rounded-lg hover:bg-white/20">Previous Step</button>
                <button
                    onClick={handleSubmit}
                    disabled={!isComplete}
                    className="px-6 py-2.5 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Complete Submission
                </button>
            </div>
        </div>
    );
};

export default Step3PsychometricTest;