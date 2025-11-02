import React, { useState } from 'react';
import { DataSource } from '../App';
import { ChevronLeftIcon } from './icons/Icons';
import Step1CompanyInfo from './founder/Step1CompanyInfo';
import Step2VoiceAgent from './founder/Step2VoiceAgent';
import Step3PsychometricTest from './founder/Step3PsychometricTest';

interface FounderRegistrationPageProps {
    onSubmit: (data: {
        companyName: string,
        description: string,
        founderPhone: string,
        founderEmail: string,
        files: DataSource[],
        transcript: DataSource | null, // Can be null if skipped
        assessment: DataSource
    }) => void;
    onBack: () => void;
}

const StageIndicator: React.FC<{ stageNumber: number; title: string; currentStage: number; onClick: (stage: number) => void; }> = ({ stageNumber, title, currentStage, onClick }) => {
    const isCompleted = currentStage > stageNumber;
    const isActive = currentStage === stageNumber;
    const isClickable = isCompleted;
    
    return (
        <div className={`flex items-center gap-4 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => isClickable && onClick(stageNumber)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'border-blue-500 bg-blue-500 text-white' : isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-600 text-gray-400'}`}>
                {isCompleted ? '✓' : stageNumber + 1}
            </div>
            <div>
                <p className={`text-sm transition-colors ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{`STEP ${stageNumber + 1}`}</p>
                <p className={`font-bold transition-colors ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{title}</p>
            </div>
        </div>
    );
};

const FounderRegistrationPage: React.FC<FounderRegistrationPageProps> = ({ onSubmit, onBack }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        companyName: '',
        description: '',
        founderPhone: '',
        founderEmail: '',
        files: [] as DataSource[],
        transcript: null as DataSource | null,
        assessment: null as DataSource | null,
    });

    const handleStep1Complete = (data: { companyName: string, description: string, founderPhone: string, founderEmail: string, files: DataSource[] }) => {
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(1);
    };

    const handleStep2Complete = (transcript: DataSource | null) => {
        setFormData(prev => ({ ...prev, transcript }));
        setCurrentStep(2);
    };

    const handleStep3Complete = (assessment: DataSource) => {
        const finalData = { ...formData, assessment };
        if(finalData.assessment) { // Transcript is now optional
            onSubmit({
                companyName: finalData.companyName,
                description: finalData.description,
                founderPhone: finalData.founderPhone,
                founderEmail: finalData.founderEmail,
                files: finalData.files,
                transcript: finalData.transcript,
                assessment: finalData.assessment,
            });
        } else {
            console.error("Submission failed: assessment is missing.");
        }
    };

    const handleStageClick = (stage: number) => {
        if (stage < currentStep) {
            setCurrentStep(stage);
        }
    }

    const handlePreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };


    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <Step1CompanyInfo initialData={formData} onComplete={handleStep1Complete} />;
            case 1:
                return <Step2VoiceAgent onComplete={handleStep2Complete} onPrevious={handlePreviousStep} />; 
            case 2:
                return <Step3PsychometricTest onComplete={handleStep3Complete} onPrevious={handlePreviousStep} />;
            default:
                return <div>Unknown Step</div>;
        }
    };
    
    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
                        <ChevronLeftIcon /> Back to Home
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Register Your Company</h1>
                    <p className="text-lg text-gray-400">Submit your information for investor evaluation.</p>
                </header>
                
                 <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <StageIndicator stageNumber={0} title="Company Information" currentStage={currentStep} onClick={handleStageClick} />
                       <div className="h-px md:h-auto w-full md:w-px bg-gray-700 mx-4 md:mx-8"></div>
                       <StageIndicator stageNumber={1} title="Founder Voice Interview" currentStage={currentStep} onClick={handleStageClick} />
                       <div className="h-px md:h-auto w-full md:w-px bg-gray-700 mx-4 md:mx-8"></div>
                       <StageIndicator stageNumber={2} title="Behavioural Assessment" currentStage={currentStep} onClick={handleStageClick} />
                    </div>
                </div>

                <div>
                    {renderCurrentStep()}
                </div>
            </div>
        </div>
    );
};

export default FounderRegistrationPage;