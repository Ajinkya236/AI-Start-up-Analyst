import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Report } from '../App';
import EditPreferencesModal from './EditPreferencesModal';
import { LoaderIcon, EditIcon, SparklesIcon } from './icons/Icons';

// FIX: Initialize with a fallback API key to avoid crashes if env var is not set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

interface Stage1InvestmentMemoProps {
  report: Report;
  onUpdateReport: (id: string, data: Partial<Report>) => void;
  onNextStage: () => void;
  onPreviousStage: () => void;
}

const Stage1InvestmentMemo: React.FC<Stage1InvestmentMemoProps> = ({ report, onUpdateReport, onNextStage, onPreviousStage }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const generateMemo = async (currentReport: Report) => {
    setIsGenerating(true);
    
    const { preferences } = currentReport.investmentMemo;
    const sources = currentReport.dataSources.filter(ds => ds.isSelected && ds.summary);

    if (sources.length === 0) {
        console.error("No sources selected or summarized.");
        onUpdateReport(report.id, {
            investmentMemo: { ...report.investmentMemo, status: 'idle', content: `// No sources selected to generate the memo. Please go back and select sources.` }
        });
        setIsGenerating(false);
        return;
    }

    const sourcesContext = sources.map(s => `Source: ${s.filename || s.type}\nSummary: ${s.summary}\n\n`).join('');
    const enabledSections = preferences.sections.filter(s => s.enabled).map(s => `- ${s.name} (Importance: ${s.weight}/25)`).join('\n');
    
    const prompt = `
        You are an AI investment analyst for a venture capital firm. Your task is to draft a comprehensive investment memo.
        
        Company: ${currentReport.companyName}
        Description: ${currentReport.description}

        Use the following summarized data sources to inform your analysis:
        --- DATA SOURCES ---
        ${sourcesContext}
        --- END DATA SOURCES ---

        The memo should have a ${preferences.tone} tone and its length should be ${preferences.length}.
        
        Generate the memo covering the following sections, with the indicated importance. Omit any sections that are not relevant or for which you have insufficient data.
        --- SECTIONS & WEIGHTS ---
        ${enabledSections}
        --- END SECTIONS ---

        Format the output in Markdown. Start with a main heading for the company name.
    `;
    
    try {
        // FIX: Use ai.models.generateContent with the correct model 'gemini-2.5-flash'.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        // FIX: Extract text directly from response.text.
        const memoContent = response.text;
        
        onUpdateReport(report.id, {
            investmentMemo: { ...report.investmentMemo, status: 'completed', content: memoContent }
        });
    } catch (error) {
        console.error("Error generating memo:", error);
        // Handle error state in UI
        onUpdateReport(report.id, {
            investmentMemo: { ...report.investmentMemo, status: 'idle', content: `// Error generating memo. Please check your API Key and the browser console for details.` }
        });
    } finally {
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Trigger generation only if status is idle and there's no content
    if (report.investmentMemo.status === 'idle' && !report.investmentMemo.content) {
      generateMemo(report);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id, report.investmentMemo.status]);

  const handleSavePreferences = (newPreferences: Report['investmentMemo']['preferences']) => {
    // FIX: Explicitly type `updatedReport` as `Report` to ensure `investmentMemo.status` is correctly typed as `AgentStatus` instead of `string`.
    // This resolves type errors when passing it to `onUpdateReport` and `generateMemo`.
    const updatedReport: Report = {
        ...report,
        investmentMemo: { ...report.investmentMemo, preferences: newPreferences, status: 'idle', content: '' } // Reset status to trigger re-generation
    };
    onUpdateReport(report.id, { investmentMemo: updatedReport.investmentMemo });
    generateMemo(updatedReport);
  };
  
  const isLoading = isGenerating || report.investmentMemo.status === 'pending' || (report.investmentMemo.status === 'idle' && !report.investmentMemo.content);

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <SparklesIcon className="text-purple-400"/> AI-Generated Investment Memo
            </h2>
            <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-lg hover:bg-[rgba(255,255,255,0.2)]">
                <EditIcon className="w-4 h-4" /> Edit Preferences
            </button>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 min-h-[500px]">
            {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-16">
                    <LoaderIcon className="w-10 h-10 mb-4"/>
                    <p className="text-lg font-semibold text-white">Generating Memo...</p>
                    <p>The AI agent is analyzing sources and drafting the memo.</p>
                </div>
            ) : (
                <div 
                    className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none whitespace-pre-wrap"
                >
                    {report.investmentMemo.content}
                </div>
            )}
        </div>

        <div className="mt-8 flex justify-between items-center">
            <button onClick={onPreviousStage} className="px-6 py-3 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
              Back to Data Collection
            </button>
            <button onClick={onNextStage} disabled={isLoading || !report.investmentMemo.content} className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
              Proceed to Curated Memo
            </button>
        </div>
        
        <EditPreferencesModal 
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            preferences={report.investmentMemo.preferences}
            onSave={handleSavePreferences}
        />
    </div>
  );
};

export default Stage1InvestmentMemo;