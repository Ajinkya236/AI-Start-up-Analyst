import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataSource } from '../../App';
import { GoogleGenAI, Chat } from '@google/genai';
import { MicIcon, XIcon, LoaderIcon, ArrowRightIcon } from '../icons/Icons';
import { decode, decodeAudioData } from './audioUtils';

// Type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}
interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
    abort: () => void;
}
declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}


interface Step2VoiceAgentProps {
    onComplete: (transcript: DataSource | null) => void;
    onPrevious: () => void;
}

type TranscriptItem = {
    speaker: 'ai' | 'user' | 'system';
    text: string;
}

const ConfirmationModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
}> = ({ onClose, onConfirm }) => (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
      <div className="bg-[rgba(30,42,58,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-md m-4">
        <h3 className="text-xl font-bold text-white mb-4">Skip Interview?</h3>
        <p className="text-[rgba(255,255,255,0.8)] mb-8">Are you sure you want to skip the voice interview? This step provides valuable context for investors.</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg hover:bg-[rgba(255,255,255,0.15)] transition-all">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm font-medium text-white bg-blue-600/80 border border-blue-500/50 rounded-lg hover:bg-blue-500/80 transition-all">Yes, Skip</button>
        </div>
      </div>
    </div>
);


const Step2VoiceAgent: React.FC<Step2VoiceAgentProps> = ({ onComplete, onPrevious }) => {
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
    const [status, setStatus] = useState<'initializing' | 'idle' | 'listening' | 'processing' | 'speaking'>('initializing');
    const [error, setError] = useState('');
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);
    const [useVoiceMode, setUseVoiceMode] = useState(true);
    const [textInput, setTextInput] = useState('');

    const chatRef = useRef<Chat | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

    const addTranscript = useCallback((item: TranscriptItem) => {
        setTranscript(prev => [...prev, item]);
    }, []);

    const stopAISpeech = useCallback(() => {
        audioQueueRef.current.forEach(source => {
            try {
                source.stop();
            } catch (e) { /* Might already be stopped */ }
        });
        audioQueueRef.current = [];
        if (audioContextRef.current && audioContextRef.current.state === 'running') {
            audioContextRef.current.suspend();
        }
    }, []);
    
    const startListening = useCallback(() => {
        if (useVoiceMode && recognitionRef.current && status !== 'listening') {
             try {
                recognitionRef.current.start();
                setStatus('listening');
            } catch (e) {
                // This can happen if start() is called while it's already running.
                // We'll just ensure the state is correct.
                console.error("Could not start recognition", e);
                if(status !== 'listening') setStatus('listening');
            }
        } else {
             setStatus('idle');
        }
    }, [useVoiceMode, status]);


    const processAIResponse = useCallback(async (text: string) => {
        addTranscript({ speaker: 'ai', text });
        setStatus('speaking');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
            const ttsPrompt = `Speak this naturally and conversationally, without awkward pauses: ${text}`;
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: ttsPrompt }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });

            const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (audioData) {
                if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                }
                 if (audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
                const audioBuffer = await decodeAudioData(decode(audioData), audioContextRef.current, 24000, 1);
                
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);
                source.onended = () => {
                    audioQueueRef.current.shift();
                    if(audioQueueRef.current.length === 0) {
                       startListening();
                    }
                };
                source.start();
                audioQueueRef.current.push(source);
            } else {
                 startListening();
            }
        } catch (e) {
            console.error('TTS failed', e);
            setError('Could not generate AI speech.');
            startListening();
        }
    }, [addTranscript, startListening]);

    const handleUserMessage = useCallback(async (message: string) => {
        if (!message.trim()) {
            startListening();
            return;
        }
        setStatus('processing');
        addTranscript({ speaker: 'user', text: message });
        try {
            const response = await chatRef.current!.sendMessage({ message });
            processAIResponse(response.text);
        } catch (e) {
            console.error("Chat send failed:", e);
            setError('Failed to get AI response.');
            setStatus('idle');
        }
    }, [addTranscript, processAIResponse, startListening]);


    useEffect(() => {
        addTranscript({ speaker: 'system', text: 'Initializing AI Assistant...' });
        const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});
        const systemInstruction = `You are an AI Assistant for Investor Evaluation. Your tone is polite, professional, and supportive. Your process is very structured. Follow these steps precisely.

        **Step 1: Introduction & Consent**
        - Greet the user politely and introduce yourself as "AI Assistant for Investor Evaluation".
        - Ask for consent: "Is this a good time to answer a few questions about you and your startup?"
        - If consent is given, proceed to Step 2. If not, politely end the call.

        **Step 2: Verification**
        - Ask for identity verification: "To start, could you please confirm your full name and your role in the company?"
        - Wait for the response.

        **Step 3: Questioning Flow (CRITICAL)**
        - You will ask the following questions ONE BY ONE. DO NOT ask the next question until you have received a relevant answer for the current one.
        - **Questioning Process for EACH question:**
            1. Ask the question clearly.
            2. Listen for the user's response.
            3. Evaluate the response. Is it a reasonable, on-topic answer to the question asked?
            4. **If the answer is relevant:** Say "Thank you." or "I see, thanks for sharing." and then immediately ask the VERY NEXT question from the list.
            5. **If the answer is vague, off-topic, or the user says "I don't know":** You must politely probe for more information. Say something like, "Could you elaborate on that a little?" or "I'd like to understand that better, could you give me a bit more detail?". DO NOT move to the next question.
            6. **If the user's response is unintelligible, nonsensical, or seems to be background noise,** you must politely repeat your last question. For example, say 'I'm sorry, I didn't quite catch that. Could you please repeat your answer?'

        **Question List:**
        1. Could you tell me about yourself and your professional journey so far?
        2. What inspired you to become a founder?
        3. What problem is your startup solving?
        4. Why do you believe your solution is unique?
        5. Who are your target customers?
        6. Can you share your current traction (customers, revenue, or adoption numbers)?
        7. Tell me about your founding team and their strengths.
        8. Where do you see your startup in the next 3–5 years?
        9. Is there anything else you’d like investors to know about you or your company?

        **Step 4: Closing**
        - After the final question is answered, thank the founder, summarize that their details will be shared with the investment analysts, and end the call by saying goodbye.

        Begin now with Step 1.`;
        
        chatRef.current = ai.chats.create({ model: 'gemini-2.5-pro', config: { systemInstruction } });

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onresult = (event) => {
                setStatus('processing'); // Stop listening animation
                handleUserMessage(event.results[0][0].transcript);
            };
            recognition.onerror = (event) => {
                 if (event.error !== 'no-speech' && event.error !== 'aborted') setError('Voice recognition error. Please try again or use text input.');
                 setStatus('idle');
            };
            recognition.onend = () => {
                // FIX: Use a functional update to get the current status, avoiding stale closure.
                // The original `if (status === 'listening')` would always be false because `status` was stale.
                setStatus(currentStatus => (currentStatus === 'listening' ? 'idle' : currentStatus));
            };
            recognitionRef.current = recognition;
        } else {
            setUseVoiceMode(false);
            setError("Voice input is not supported. Please use text input.");
        }

        setStatus('processing');
        chatRef.current.sendMessage({ message: "Please introduce yourself and start the interview." })
            .then(response => processAIResponse(response.text))
            .catch(e => {
                setError("Failed to initialize the AI agent.");
                setStatus('idle');
            });

        return () => {
            recognitionRef.current?.abort();
            stopAISpeech();
            audioContextRef.current?.close();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);
    
    const handleTextSubmit = () => {
        if (!textInput.trim() || status !== 'idle') return;
        handleUserMessage(textInput);
        setTextInput('');
    }

    const toggleVoiceRecording = () => {
        if (!useVoiceMode || !recognitionRef.current) return;
        
        if (status === 'speaking') {
            stopAISpeech();
            setTimeout(() => startListening(), 50); // Small delay to allow state to update
        } else if (status === 'listening') {
            recognitionRef.current.stop();
            setStatus('idle');
        } else if (status === 'idle') {
            startListening();
        }
    }

    const handleSkip = () => {
        setShowSkipConfirm(false);
        onComplete(null);
    };

    const isInterviewFinished = transcript.some(t => t.speaker === 'ai' && (t.text.toLowerCase().includes('thank you for your time') || t.text.toLowerCase().includes('have a great day')));

    const handleComplete = () => {
        const fullTranscript = transcript.map(t => `${t.speaker.toUpperCase()}: ${t.text}`).join('\n\n');
        const finalReport = `# Founder Voice Interview Transcript\n**Call Metadata:**\n- **Date/Time:** ${new Date().toISOString()}\n- **Outcome:** Success\n---\n**Transcript:**\n${fullTranscript}`;
        onComplete({
            id: `transcript-${Date.now()}`,
            type: 'transcript', content: finalReport, filename: 'Founder Voice Interview Transcript',
            status: 'Completed', isSelected: true
        });
    };
    
    const isProcessing = status === 'processing' || status === 'initializing';

    return (
         <div className="max-w-4xl mx-auto bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 relative">
            {showSkipConfirm && <ConfirmationModal onClose={() => setShowSkipConfirm(false)} onConfirm={handleSkip} />}
            <h2 className="text-2xl font-bold text-white mb-6">Step 2: Founder Voice Interview</h2>
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 bg-black/20 rounded-lg p-4 h-[28rem] overflow-y-auto space-y-4">
                     {transcript.map((item, i) => (
                        <div key={i} className={`flex gap-3 ${item.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {item.speaker === 'ai' && <div className="w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center flex-shrink-0 font-bold text-white">A</div>}
                           <p className={`max-w-md p-3 rounded-lg ${item.speaker === 'ai' ? 'bg-gray-700 text-white' : item.speaker === 'user' ? 'bg-blue-600 text-white' : 'text-center text-gray-400 text-xs italic w-full'}`}>{item.text}</p>
                        </div>
                     ))}
                     {status === 'listening' && <div className="text-center text-blue-400 italic">Listening...</div>}
                     <div ref={transcriptEndRef} />
                </div>
                <div className="w-full lg:w-1/3 flex flex-col items-center justify-center bg-black/20 rounded-lg p-4">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <div className={`absolute inset-0 bg-blue-500 rounded-full transition-all duration-500 ${status === 'speaking' ? 'opacity-30 scale-100' : 'opacity-0 scale-75'}`} style={{ animation: status === 'speaking' ? 'pulse 2s infinite' : 'none' }}></div>
                        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
                    </div>
                    
                    <div className="w-full mt-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className={`text-sm ${useVoiceMode ? 'text-white' : 'text-gray-500'}`}>Voice Mode</span>
                            <button onClick={() => setUseVoiceMode(!useVoiceMode)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useVoiceMode ? 'bg-blue-600' : 'bg-gray-600'}`}>
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useVoiceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {useVoiceMode ? (
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={() => setShowSkipConfirm(true)} className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors" title="Skip Interview"><XIcon className="w-8 h-8 text-white"/></button>
                                <button onClick={toggleVoiceRecording} disabled={isProcessing} className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${status === 'listening' ? 'bg-red-600 animate-pulse' : 'bg-red-500 hover:bg-red-600'}`}>
                                    {status === 'listening' ? <LoaderIcon className="w-8 h-8"/> : <MicIcon className="w-10 h-10 text-white"/>}
                                </button>
                            </div>
                        ) : (
                             <div className="flex items-center gap-2">
                                <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTextSubmit()} placeholder="Type your response..." disabled={status !== 'idle'} className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-800"/>
                                <button onClick={handleTextSubmit} disabled={status !== 'idle' || !textInput.trim()} className="p-2.5 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:bg-gray-600"><ArrowRightIcon className="w-5 h-5"/></button>
                            </div>
                        )}
                         {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                    </div>

                </div>
            </div>
            <div className="mt-8 flex justify-between">
                <button onClick={onPrevious} className="px-6 py-2.5 font-semibold text-white bg-white/10 rounded-lg hover:bg-white/20">Previous Step</button>
                <button onClick={handleComplete} disabled={!isInterviewFinished || status === 'speaking' || status === 'processing'} className="px-6 py-2.5 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Next: Behavioural Assessment
                </button>
            </div>
            <style>{`
                @keyframes pulse {
                  0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                  70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
                  100% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
            `}</style>
        </div>
    );
};

export default Step2VoiceAgent;