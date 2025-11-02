import React, { useState, useEffect, useRef } from 'react';
import { Report, DataSource } from '../App';
import { XIcon, SparklesIcon, LoaderIcon, ArrowRightIcon } from './icons/Icons';
import { GoogleGenAI, Chat } from '@google/genai';

interface DeepResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report;
  onAddSource: (source: Omit<DataSource, 'id' | 'status' | 'isSelected'>) => void;
}

const samplePrompts = [
    "What is the total addressable market (TAM), serviceable available market (SAM), and serviceable obtainable market (SOM) for this company?",
    "Who are the main competitors and what are their key strengths and weaknesses?",
    "Find recent news and market trends relevant to this industry.",
    "Summarize the public background and past ventures of the founders.",
];

type Message = {
    role: 'user' | 'model';
    content: string;
}

const DeepResearchModal: React.FC<DeepResearchModalProps> = ({ isOpen, onClose, report, onAddSource }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatRef = useRef<Chat | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const initializeChat = () => {
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
        const systemInstruction = `You are a world-class VC research analyst. Your goal is to help the user perform deep research on a company called "${report.companyName}".
        - Use the Google Search tool to find the most up-to-date information.
        - If a user's query is broad, ask clarifying questions to narrow down the scope. For example, if they ask for "competitors", you can ask "Should I focus on direct competitors in North America, or global players as well?".
        - Keep your responses concise and well-structured. Use markdown for formatting.
        - Start the conversation by greeting the user and suggesting some research topics.`;
        
        chatRef.current = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction,
                tools: [{googleSearch: {}}],
            },
        });

        // Start the conversation
        setIsLoading(true);
        // FIX: Argument of type 'string' is not assignable to parameter of type 'SendMessageParameters'.
        chatRef.current.sendMessage({ message: "Hello" }).then(response => {
            setMessages([{role: 'model', content: response.text}]);
        }).catch(e => {
            console.error(e);
            setError("Failed to initialize the research agent.");
        }).finally(() => {
            setIsLoading(false);
        });
    };

    useEffect(() => {
        if (isOpen) {
            setMessages([]);
            setUserInput('');
            setError('');
            setIsLoading(false);
            initializeChat();
        }
    }, [isOpen]);
    
     useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', content: messageText };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        setError('');

        try {
            // FIX: Argument of type 'string' is not assignable to parameter of type 'SendMessageParameters'.
            const response = await chatRef.current!.sendMessage({ message: messageText });
            const modelMessage: Message = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (e) {
            console.error("Chat send failed:", e);
            setError('There was an issue communicating with the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }
    
    const handleAddResearchToSources = () => {
        const conversationText = messages.map(m => `**${m.role === 'user' ? 'Analyst' : 'AI Research Agent'}:**\n${m.content}`).join('\n\n---\n\n');
        
        onAddSource({
            type: 'research',
            content: conversationText,
            filename: `Deep Research Log for ${report.companyName}`,
            summary: `Conversational research on topics including "${messages.find(m => m.role==='user')?.content.substring(0, 50)}..."`
        });
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={onClose}>
            <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-3xl m-4 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-green-300"/>
                        <h2 className="text-2xl font-bold text-white">Deep Research Agent</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                        <XIcon />
                    </button>
                </div>
                
                <div className="flex-grow bg-black/20 rounded-lg p-4 overflow-y-auto mb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0 font-bold">A</div>}
                            <div className={`max-w-xl p-3 rounded-lg prose prose-invert prose-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                        </div>
                    ))}
                     {messages.length === 1 && !isLoading && (
                        <div className="mt-6">
                             <p className="text-sm text-gray-400 mb-2">Or, start with a suggestion:</p>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {samplePrompts.map(prompt => (
                                    <button key={prompt} onClick={() => handleSendMessage(prompt)} className="p-3 text-left text-sm rounded-lg bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors">
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                
                <div className="flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage(userInput)}
                            placeholder="Ask a question..."
                            className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={() => handleSendMessage(userInput)} disabled={isLoading || !userInput.trim()} className="px-4 py-2.5 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-gray-600">
                            {isLoading ? <LoaderIcon className="w-5 h-5"/> : <ArrowRightIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                     {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>

                <div className="mt-6 flex justify-end flex-shrink-0">
                   {messages.length > 1 && (
                        <button onClick={handleAddResearchToSources} disabled={isLoading} className="px-6 py-2.5 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center">
                            Add Research to Sources
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeepResearchModal;