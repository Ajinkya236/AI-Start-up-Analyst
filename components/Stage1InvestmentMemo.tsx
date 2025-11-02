import React, { useState, useEffect } from 'react';
import { Report } from '../App';
import { GoogleGenAI } from '@google/genai';
import { LoaderIcon, ChevronLeftIcon, SparklesIcon, DownloadIcon, ChevronDownIcon } from './icons/Icons';
import EditPreferencesModal from './EditPreferencesModal';
import { generatePptx } from './pptxGenerator';

// A simple component to render markdown-like text.
const SimpleMarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Basic rendering for headers, lists, bold text.
    const lines = content.split('\n');
    return (
        <div className="prose prose-invert max-w-none text-gray-300" id="printable-memo">
            {lines.map((line, index) => {
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-3xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{line.substring(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3 border-b border-gray-800 pb-2">{line.substring(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-xl font-semibold text-white mt-4 mb-2">{line.substring(4)}</h3>;
                }
                if (line.startsWith('- ')) {
                    const subItems = line.split('\n').map(sub => sub.trim().replace(/^- \s*/, ''));
                    return <ul key={index} className="list-disc pl-5"><li>{subItems}</li></ul>
                }
                if (line.trim() === '') {
                    return <br key={index} />;
                }
                // Basic bold support
                const parts = line.split('**');
                return (
                    <p key={index} className="mb-2 leading-relaxed">
                        {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                    </p>
                );
            })}
        </div>
    );
};

interface Stage1InvestmentMemoProps {
  report: Report;
  onUpdateReport: (id: string, data: Partial<Report>, callback?: () => void) => void;
  onNextStage: () => void;
  onPreviousStage: () => void;
}

const Stage1InvestmentMemo: React.FC<Stage1InvestmentMemoProps> = ({ report, onUpdateReport, onNextStage, onPreviousStage }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [isPrefsModalOpen, setPrefsModalOpen] = useState(false);

  const handleGenerateMemo = async () => {
    setIsGenerating(true);
    setError('');
    onUpdateReport(report.id, {
      investmentMemo: { ...report.investmentMemo, status: 'pending' }
    });
    
    const selectedSources = report.dataSources.filter(ds => ds.isSelected && ds.status === 'Completed');
    if (selectedSources.length === 0) {
      setError('No completed and selected data sources to generate memo from.');
      setIsGenerating(false);
      onUpdateReport(report.id, { investmentMemo: { ...report.investmentMemo, status: 'idle' } });
      return;
    }

    const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
    
    const sourcesContext = selectedSources.map(source => `
      ---
      Source Type: ${source.type}
      Source Name: ${source.filename}
      Source Content:
      ${source.summary || source.content}
      ---
    `).join('\n');
    
    const preferences = report.investmentMemo.preferences.sections
      .filter(s => s.enabled)
      .map(s => `- ${s.name} (Weight: ${s.weight}%)`)
      .join('\n');

    const prompt = `
      You are an AI investment analyst at a top-tier venture capital firm. Your task is to draft a comprehensive, data-driven investment memo for a potential seed-stage investment in a company called "${report.companyName}".
      Use the following ingested data sources to form your analysis. Be critical and objective. If information is missing, state it explicitly. Do not invent information.
      
      **Data Sources:**
      ${sourcesContext}

      **Memo Structure and Preferences:**
      Generate the memo in Markdown format. The structure and focus should be guided by the following sections:
      ${preferences}
      
      For the 'Screening Report' section, if present, compare data provided by the founder (e.g., pitch decks, transcripts) against data from independent research. Identify "green flags" (positive indicators, consistencies) and "red flags" (discrepancies, concerns) and provide an overall AI confidence score from 0 to 100 on the founder's claims.

      **Instructions:**
      1.  **Synthesize, Don't Just Summarize:** Analyze and connect information across different sources.
      2.  **Maintain a Professional Tone:** Use clear, concise language suitable for an investment committee.
      3.  **Identify Strengths & Weaknesses:** For each section, provide a balanced view, highlighting both positive aspects and potential risks or concerns.
      4.  **Format Clearly:** Use Markdown headers (##) for each section. Use bullet points for clarity.

      Begin the memo now.
    `;

    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      const memoContent = response.text;
      
      onUpdateReport(report.id, {
        investmentMemo: { ...report.investmentMemo, status: 'completed', content: memoContent }
      });
    } catch (e) {
      console.error("Memo generation failed:", e);
      setError(`Gemini API call failed. ${e instanceof Error ? e.message : String(e)}`);
      onUpdateReport(report.id, { investmentMemo: { ...report.investmentMemo, status: 'idle' } });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!report.investmentMemo.content && report.investmentMemo.status === 'idle') {
      handleGenerateMemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);


  const handleProceed = (preferences: Report['curatedMemo']['preferences']) => {
    onUpdateReport(report.id, {
      curatedMemo: {
        ...report.curatedMemo,
        preferences,
        content: '', // Reset content to trigger curation
        status: 'idle',
      },
    }, onNextStage);
  };
  
  const handleDownload = async (format: 'PDF' | 'PPTX') => {
      if (!report.investmentMemo.content) return;
      if (format === 'PDF') {
          window.print();
      } else if (format === 'PPTX') {
          setIsDownloading(true);
          try {
              await generatePptx(report.investmentMemo.content, report.companyName);
          } catch (e) {
              console.error("PPTX Generation failed", e);
              alert("Failed to generate PowerPoint presentation.");
          } finally {
              setIsDownloading(false);
          }
      }
  };
  
  const isLoading = isGenerating || report.investmentMemo.status === 'pending';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <EditPreferencesModal 
        isOpen={isPrefsModalOpen}
        onClose={() => setPrefsModalOpen(false)}
        onSave={handleProceed}
        initialPreferences={report.curatedMemo.preferences}
        saveButtonText="Generate Curated Memo"
      />
      <div className="lg:col-span-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">AI-Generated Memo Draft</h2>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <LoaderIcon className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg">Generating memo based on sources...</p>
            <p className="text-sm">This may take a minute.</p>
          </div>
        )}
        {error && (
            <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
                <button onClick={handleGenerateMemo} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500">
                    Retry Generation
                </button>
            </div>
        )}
        {!isLoading && report.investmentMemo.content && (
           <div className="prose prose-invert max-w-none">
                <SimpleMarkdownRenderer content={report.investmentMemo.content} />
           </div>
        )}
      </div>
      
      <div className="lg:col-span-1">
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 sticky top-8">
            <h3 className="text-xl font-bold text-white mb-4">Controls & Actions</h3>
             <div className="relative inline-block w-full mb-4">
                <DownloadDropdown onDownload={handleDownload} isLoading={isDownloading} />
            </div>
            <button
                onClick={handleGenerateMemo}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? <LoaderIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                {isLoading ? 'Generating...' : 'Regenerate Memo'}
            </button>
            <div className="mt-8 flex justify-between items-center">
                <button onClick={onPreviousStage} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                    <ChevronLeftIcon /> Back
                </button>
                <button
                    onClick={() => setPrefsModalOpen(true)}
                    disabled={!report.investmentMemo.content || isLoading}
                    className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                    Proceed to Curate Memo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const DownloadDropdown: React.FC<{onDownload: (format: 'PDF' | 'PPTX') => void; isLoading: boolean}> = ({ onDownload, isLoading }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block w-full" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? <><LoaderIcon className="w-4 h-4" /> Generating...</> : <><DownloadIcon className="w-4 h-4" /> Download</>}
                 <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                 <div className="absolute top-full right-0 mt-2 w-full bg-[rgba(30,42,58,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-lg shadow-2xl z-10">
                    <button onClick={() => { onDownload('PPTX'); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-t-lg">
                        PowerPoint (.pptx)
                    </button>
                    <button onClick={() => { onDownload('PDF'); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-b-lg">
                        PDF Document
                    </button>
                </div>
            )}
        </div>
    );
};


export default Stage1InvestmentMemo;