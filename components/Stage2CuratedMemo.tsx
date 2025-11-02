import React, { useState, useEffect, useRef } from 'react';
import { Report } from '../App';
import { GoogleGenAI } from '@google/genai';
import { LoaderIcon, ChevronLeftIcon, EditIcon, SparklesIcon, DownloadIcon, ChevronDownIcon } from './icons/Icons';
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


interface Stage2CuratedMemoProps {
  report: Report;
  onUpdateReport: (id: string, data: Partial<Report>, callback?: () => void) => void;
  onPreviousStage: () => void;
}

const Stage2CuratedMemo: React.FC<Stage2CuratedMemoProps> = ({ report, onUpdateReport, onPreviousStage }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');
  const [isPrefsModalOpen, setPrefsModalOpen] = useState(false);

  const generateCuratedMemo = async () => {
    setIsGenerating(true);
    setError('');
    onUpdateReport(report.id, { curatedMemo: { ...report.curatedMemo, status: 'pending' } });
    
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
    
    const { tone, length, customInstructions, sections } = report.curatedMemo.preferences;
    const enabledSections = sections.filter(s => s.enabled).map(s => `- ${s.name} (Emphasis: ${s.weight}%)`).join('\n');

    const prompt = `
      You are an AI assistant for a top-tier venture capital firm. Your task is to take an existing internal investment memo draft and curate it into a final, polished version based on specific instructions.

      **Original Investment Memo Draft:**
      ---
      ${report.investmentMemo.content}
      ---

      **Curation Instructions:**
      - **Memo Tone:** ${tone}. Adjust the language and framing to match this tone. (Formal: professional, objective, data-centric. Balanced: professional but engaging. Bullish: optimistic, emphasizing strengths and potential).
      - **Memo Length:** ${length}. (Concise: ~500 words, high-level summary. Standard: ~1500 words, detailed analysis. Detailed: ~3000+ words, exhaustive and granular).
      - **Custom Instructions:** ${customInstructions || 'None.'}
      - **Sections & Emphasis:** Rewrite and restructure the memo to include the following sections, paying attention to the emphasis weight. Higher weight means more detail and prominence.
      
      ${enabledSections}

      Rewrite the original memo according to all the instructions above. The output should be in clean, well-formatted Markdown.
    `;

    try {
      const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      const curatedContent = response.text;
      
      onUpdateReport(report.id, {
        curatedMemo: { ...report.curatedMemo, status: 'completed', content: curatedContent }
      });
    } catch (e) {
      console.error("Curated memo generation failed:", e);
      setError(`Failed to generate curated memo. ${e instanceof Error ? e.message : String(e)}`);
      onUpdateReport(report.id, { curatedMemo: { ...report.curatedMemo, status: 'idle' } });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
     if (!report.curatedMemo.content && report.curatedMemo.status === 'idle') {
      generateCuratedMemo();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);


  const handleSavePreferences = (newPreferences: Report['curatedMemo']['preferences']) => {
    onUpdateReport(report.id, {
        curatedMemo: { ...report.curatedMemo, preferences: newPreferences, content: '', status: 'idle' }
    }, () => {
        // Trigger regeneration after state is set
        generateCuratedMemo();
    });
  };
  
  const handleDownload = async (format: 'PDF' | 'PPTX') => {
      if (!report.curatedMemo.content) return;
      if (format === 'PDF') {
          window.print();
      } else if (format === 'PPTX') {
          setIsDownloading(true);
          try {
              await generatePptx(report.curatedMemo.content, report.companyName);
          } catch (e) {
              console.error("PPTX Generation failed", e);
              alert("Failed to generate PowerPoint presentation.");
          } finally {
              setIsDownloading(false);
          }
      }
  };
  
  const isLoading = isGenerating || report.curatedMemo.status === 'pending';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <EditPreferencesModal
        isOpen={isPrefsModalOpen}
        onClose={() => setPrefsModalOpen(false)}
        onSave={handleSavePreferences}
        initialPreferences={report.curatedMemo.preferences}
        saveButtonText="Save & Regenerate"
      />
      <div className="lg:col-span-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Curated Memo</h2>
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400">
            <LoaderIcon className="w-12 h-12 animate-spin mb-4" />
            <p className="text-lg">Curating memo based on your preferences...</p>
          </div>
        )}
         {error && (
            <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400">{error}</p>
                <button onClick={generateCuratedMemo} className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500">
                    Retry Generation
                </button>
            </div>
        )}
        {!isLoading && report.curatedMemo.content && (
           <div className="prose prose-invert max-w-none">
                <SimpleMarkdownRenderer content={report.curatedMemo.content} />
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
                onClick={() => setPrefsModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition-colors mb-4"
            >
                <EditIcon className="w-4 h-4"/> Edit Preferences
            </button>
             <button
                onClick={generateCuratedMemo}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mb-4"
            >
                {isLoading ? <LoaderIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                {isLoading ? 'Generating...' : 'Regenerate'}
            </button>
            <div className="mt-8 flex justify-start items-center">
                <button onClick={onPreviousStage} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                    <ChevronLeftIcon /> Back to Draft
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


export default Stage2CuratedMemo;