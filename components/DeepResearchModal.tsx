import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Report, DataSource } from '../App';
import { XIcon, SparklesIcon, LoaderIcon } from './icons/Icons';

// FIX: Added full implementation of DeepResearchModal.tsx to provide AI-powered research capabilities using the Gemini API.

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onAddSource: (source: Omit<DataSource, 'id' | 'status' | 'isSelected'>) => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

const DeepResearchModal: React.FC<DeepResearchModalProps> = ({ isOpen, onClose, report, onAddSource }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sources, setSources] = useState<any[]>([]);
    
    const suggestedQueries = [
        `What is the market size (TAM, SAM, SOM) for ${report.description}?`,
        `Who are the main competitors for ${report.companyName}?`,
        `Recent news and funding rounds related to ${report.companyName}.`,
        `Key technology trends in the ${report.description.split(" for ")[1] || 'sector'}.`
    ];

    const handleResearch = async (researchQuery: string) => {
        if(!researchQuery.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);
        setSources([]);

        try {
            // FIX: Use ai.models.generateContent instead of a deprecated method.
            // Use the gemini-2.5-flash model as specified in the guidelines.
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: researchQuery,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            // FIX: Extract text directly from the response.text property.
            const text = response.text;
            setResult(text);
            
            // FIX: Correctly access grounding metadata for sources.
            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setSources(groundingChunks);

        } catch (e: any) {
            console.error("Gemini API call failed", e);
            setError(`Failed to perform research. ${e.message || 'Please check your API key and try again.'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddResultAsSource = () => {
        if(result) {
            onAddSource({
                type: 'research',
                content: `Query: ${query}\n\nResult:\n${result}`,
                filename: `Research: ${query.substring(0, 40)}...`
            });
            handleClose();
        }
    }

    const handleClose = () => {
        setQuery('');
        setResult(null);
        setError(null);
        setIsLoading(false);
        setSources([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={handleClose}>
            <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-2xl m-4 flex flex-col" style={{height: '90vh'}} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                         <SparklesIcon className="w-6 h-6 text-green-300"/>
                        <h2 className="text-2xl font-bold text-white">Deep Research Agent</h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                        <XIcon />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {!result && !isLoading && !error && (
                         <div className="text-center p-8">
                            <h3 className="text-lg font-semibold text-white mb-4">What do you want to research?</h3>
                            <p className="text-gray-400 mb-6">Ask about market size, competitors, recent news, etc.</p>
                            <div className="space-y-3">
                                {suggestedQueries.map((q, i) => (
                                    <button key={i} onClick={() => {setQuery(q); handleResearch(q);}} className="w-full text-left p-3 bg-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.2)] text-sm text-gray-300 transition-colors">
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                     {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                           <LoaderIcon className="w-10 h-10 mb-4"/>
                           <p className="text-lg font-semibold text-white">Researching...</p>
                           <p>The AI agent is scanning sources to find answers.</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center p-8 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <h3 className="text-lg font-semibold text-red-300 mb-2">An Error Occurred</h3>
                            <p className="text-red-300/80">{error}</p>
                        </div>
                    )}
                    
                    {result && (
                        <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-w-none">
                           <h3 className="text-xl font-bold mb-4">Research Results</h3>
                           <p style={{whiteSpace: 'pre-wrap'}}>{result}</p>
                           {sources.length > 0 && (
                               <div>
                                   <h4 className="font-semibold mt-6 mb-2">Sources:</h4>
                                   <ul className="list-disc pl-5 space-y-1 text-sm">
                                       {sources.map((chunk, index) => (
                                           <li key={index}>
                                               <a href={chunk.web?.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                   {chunk.web?.title || chunk.web?.uri}
                                               </a>
                                           </li>
                                       ))}
                                   </ul>
                               </div>
                           )}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex-shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleResearch(query)}
                            placeholder="Ask a follow-up question or start a new research..."
                            className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg pl-4 pr-28 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button onClick={() => handleResearch(query)} disabled={isLoading || !query} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : 'Ask'}
                        </button>
                    </div>
                     {result && (
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleAddResultAsSource} className="px-5 py-2.5 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors">
                                Add Result as Data Source
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeepResearchModal;
