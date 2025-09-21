import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Report } from '../App';
import EditCuratedPreferencesModal from './EditCuratedPreferencesModal';
import { LoaderIcon, EditIcon, DownloadIcon, SparklesIcon } from './icons/Icons';

// FIX: Added full implementation of Stage2CuratedMemo.tsx, which was missing.
// This component represents the final stage of the report workflow. It allows users to refine the AI-generated memo,
// apply final presentation preferences, and download the result.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

interface Stage2CuratedMemoProps {
  report: Report;
  onUpdateReport: (id: string, data: Partial<Report>) => void;
  onPreviousStage: () => void;
}

const Stage2CuratedMemo: React.FC<Stage2CuratedMemoProps> = ({ report, onUpdateReport, onPreviousStage }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editableContent, setEditableContent] = useState(report.curatedMemo.content || report.investmentMemo.content);

  const generateCuratedMemo = async (currentReport: Report, currentContent: string) => {
    setIsGenerating(true);
    const { preferences } = currentReport.curatedMemo;

    const prompt = `
      You are an AI assistant for a venture capital firm. Your task is to refine an existing investment memo based on specific preferences.

      Original Memo Content:
      ---
      ${currentContent}
      ---

      Refinement Instructions:
      - Target Audience: ${preferences.audience}. Adjust the tone, language, and level of detail accordingly. For "LP Facing", be more formal and high-level. For "Internal", keep technical details. For "External", make it professional but accessible.
      - Desired Format: ${preferences.format}. Ensure the output is clean Markdown.
      - Review the entire memo for clarity, conciseness, and impact.
      - Do not introduce new facts, but rephrase and restructure the existing content to better suit the target audience.

      Return only the refined Markdown content.
    `;

    try {
        // FIX: Use ai.models.generateContent with the correct model 'gemini-2.5-flash'.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        
        // FIX: Extract text directly from response.text.
        const curatedContent = response.text;
        
        // FIX: Explicitly type `updatedMemo` to prevent `status` being widened to `string`, which is not assignable to `AgentStatus`.
        const updatedMemo: Report['curatedMemo'] = { ...report.curatedMemo, status: 'completed', content: curatedContent };
        onUpdateReport(report.id, { curatedMemo: updatedMemo });
        setEditableContent(curatedContent);
    } catch (error) {
        console.error("Error generating curated memo:", error);
        // FIX: Explicitly type `updatedMemo` to prevent `status` being widened to `string`, which is not assignable to `AgentStatus`.
        const updatedMemo: Report['curatedMemo'] = { ...report.curatedMemo, status: 'idle', content: `// Error generating curated memo. Please check your API Key and try again.` };
        onUpdateReport(report.id, { curatedMemo: updatedMemo });
        setEditableContent(updatedMemo.content);
    } finally {
        setIsGenerating(false);
    }
  };
  
  // Trigger generation if curated memo is empty but investment memo exists
  useEffect(() => {
    if (!report.curatedMemo.content && report.investmentMemo.content) {
      generateCuratedMemo(report, report.investmentMemo.content);
    } else {
        // Ensure local state is synced with report prop
        setEditableContent(report.curatedMemo.content || report.investmentMemo.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id, report.curatedMemo.content, report.investmentMemo.content]);

  const handleSavePreferences = (newPreferences: Report['curatedMemo']['preferences']) => {
    const updatedReport = {
        ...report,
        curatedMemo: { ...report.curatedMemo, preferences: newPreferences }
    };
    onUpdateReport(report.id, { curatedMemo: updatedReport.curatedMemo });
    // Regenerate with new preferences
    generateCuratedMemo(updatedReport, editableContent);
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditableContent(e.target.value);
  }

  const handleBlur = () => {
    // Save on blur if content has changed
    if(editableContent !== report.curatedMemo.content) {
       onUpdateReport(report.id, { curatedMemo: { ...report.curatedMemo, content: editableContent } });
    }
  }
  
  const handleDownload = () => {
    const blob = new Blob([editableContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.companyName.replace(/\s+/g, '_')}_Investment_Memo.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isLoading = isGenerating || (report.curatedMemo.status !== 'completed' && report.investmentMemo.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <SparklesIcon className="text-purple-400"/> Curated Investment Memo
            </h2>
            <div className="flex items-center gap-2">
                 <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded-lg hover:bg-[rgba(255,255,255,0.2)]">
                    <EditIcon className="w-4 h-4" /> Edit Preferences
                </button>
                 <button onClick={handleDownload} disabled={!editableContent} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600">
                    <DownloadIcon className="w-4 h-4" /> Download
                </button>
            </div>
        </div>
        
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-1 min-h-[500px]">
             {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-16">
                    <LoaderIcon className="w-10 h-10 mb-4"/>
                    <p className="text-lg font-semibold text-white">Curating Memo...</p>
                    <p>The AI agent is refining the memo for your selected audience.</p>
                </div>
            ) : (
                <textarea 
                    value={editableContent}
                    onChange={handleContentChange}
                    onBlur={handleBlur}
                    className="w-full h-[600px] bg-transparent text-gray-300 p-5 outline-none resize-none"
                    placeholder="Your curated memo will appear here..."
                />
            )}
        </div>

        <div className="mt-8 flex justify-between items-center">
            <button onClick={onPreviousStage} className="px-6 py-3 font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors">
              Back to AI Memo
            </button>
            <button onClick={() => alert("Report finalized!")} className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
              Finalize & Complete
            </button>
        </div>

        <EditCuratedPreferencesModal 
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            preferences={report.curatedMemo.preferences}
            onSave={handleSavePreferences}
        />
    </div>
  );
};

export default Stage2CuratedMemo;