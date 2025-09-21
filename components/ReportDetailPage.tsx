import React from 'react';
import { Report } from '../App';
import Stage0DataCollection from './Stage0DataCollection';
import Stage1InvestmentMemo from './Stage1InvestmentMemo';
import Stage2CuratedMemo from './Stage2CuratedMemo';
import { ChevronLeftIcon } from './icons/Icons';

interface ReportDetailPageProps {
  report: Report;
  onUpdateReport: (id: string, data: Partial<Report>) => void;
  onBack: () => void;
}

const StageIndicator: React.FC<{ stageNumber: number; title: string; currentStage: number; onClick: (stage: number) => void }> = ({ stageNumber, title, currentStage, onClick }) => {
    const isCompleted = currentStage > stageNumber;
    const isActive = currentStage === stageNumber;
    
    return (
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onClick(stageNumber)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-blue-500 bg-blue-500 text-white' : isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-600 text-gray-400'}`}>
                {isCompleted ? '✓' : stageNumber + 1}
            </div>
            <div>
                <p className={`text-sm ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{`STEP ${stageNumber + 1}`}</p>
                <p className={`font-bold ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`}>{title}</p>
            </div>
        </div>
    );
};


const ReportDetailPage: React.FC<ReportDetailPageProps> = ({ report, onUpdateReport, onBack }) => {
    
    const handleStageChange = (stage: number) => {
        // Allow navigation only to completed stages or the current stage
        if(stage <= report.currentStage) {
            onUpdateReport(report.id, { currentStage: stage });
        }
    };
    
    const handleNextStage = () => {
        if(report.currentStage < 2) {
            onUpdateReport(report.id, { currentStage: report.currentStage + 1 });
        }
    }

    const handlePreviousStage = () => {
        if (report.currentStage > 0) {
            onUpdateReport(report.id, { currentStage: report.currentStage - 1 });
        }
    }

    const renderCurrentStage = () => {
        switch (report.currentStage) {
            case 0:
                return <Stage0DataCollection report={report} onUpdateReport={onUpdateReport} onNextStage={handleNextStage} />;
            case 1:
                return <Stage1InvestmentMemo report={report} onUpdateReport={onUpdateReport} onNextStage={handleNextStage} onPreviousStage={handlePreviousStage} />;
            case 2:
                return <Stage2CuratedMemo report={report} onUpdateReport={onUpdateReport} onPreviousStage={handlePreviousStage} />;
            default:
                return <div>Unknown Stage</div>;
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
                        <ChevronLeftIcon /> Back to Reports
                    </button>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">{report.title}</h1>
                    <p className="text-lg text-gray-400">{report.companyName}</p>
                </header>

                <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                       <StageIndicator stageNumber={0} title="Data Collection" currentStage={report.currentStage} onClick={handleStageChange} />
                       <div className="h-px md:h-auto w-full md:w-px bg-gray-700 mx-4 md:mx-8"></div>
                       <StageIndicator stageNumber={1} title="Investment Memo" currentStage={report.currentStage} onClick={handleStageChange} />
                       <div className="h-px md:h-auto w-full md:w-px bg-gray-700 mx-4 md:mx-8"></div>
                       <StageIndicator stageNumber={2} title="Curated Memo" currentStage={report.currentStage} onClick={handleStageChange} />
                    </div>
                </div>

                <div>
                    {renderCurrentStage()}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailPage;