import React, { useState } from 'react';
import { Report } from '../App';
import { XIcon } from './icons/Icons';

interface EditPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPreferences: Report['curatedMemo']['preferences'];
    onSave: (newPreferences: Report['curatedMemo']['preferences']) => void;
    saveButtonText?: string;
}

const EditPreferencesModal: React.FC<EditPreferencesModalProps> = ({ isOpen, onClose, initialPreferences, onSave, saveButtonText }) => {
    const [prefs, setPrefs] = useState(initialPreferences);

    if (!isOpen) return null;
    
    const handleSectionToggle = (index: number) => {
        const newSections = [...prefs.sections];
        newSections[index].enabled = !newSections[index].enabled;
        setPrefs(p => ({...p, sections: newSections}));
    };

    const handleWeightChange = (index: number, weight: number) => {
        const newSections = [...prefs.sections];
        newSections[index].weight = weight;
        setPrefs(p => ({...p, sections: newSections}));
    };

    const handleSave = () => {
        onSave(prefs);
        onClose();
    };
    
    const PrefButton = <T extends string>({label, value, currentValue, setter}: {label: string, value: T, currentValue: T, setter: (value: T) => void}) => (
        <button
          onClick={() => setter(value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
            currentValue === value ? 'bg-blue-600 text-white' : 'bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'
          }`}
        >
          {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={onClose}>
            <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-3xl m-4 flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Edit Memo Preferences</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                        <XIcon />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                    <div>
                        <h3 className="text-base font-semibold text-gray-300 mb-2">Memo Tone</h3>
                        <div className="flex gap-2">
                           <PrefButton label="Formal" value="Formal" currentValue={prefs.tone} setter={(v) => setPrefs(p => ({...p, tone: v}))} />
                           <PrefButton label="Balanced" value="Balanced" currentValue={prefs.tone} setter={(v) => setPrefs(p => ({...p, tone: v}))} />
                           <PrefButton label="Bullish" value="Bullish" currentValue={prefs.tone} setter={(v) => setPrefs(p => ({...p, tone: v}))} />
                        </div>
                    </div>
                     <div>
                        <h3 className="text-base font-semibold text-gray-300 mb-2">Memo Length</h3>
                        <div className="flex gap-2">
                           <PrefButton label="Concise" value="Concise" currentValue={prefs.length} setter={(v) => setPrefs(p => ({...p, length: v}))} />
                           <PrefButton label="Standard" value="Standard" currentValue={prefs.length} setter={(v) => setPrefs(p => ({...p, length: v}))} />
                           <PrefButton label="Detailed" value="Detailed" currentValue={prefs.length} setter={(v) => setPrefs(p => ({...p, length: v}))} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-300 mb-2">Custom Instructions</h3>
                        <textarea
                            value={prefs.customInstructions}
                            onChange={(e) => setPrefs(p => ({...p, customInstructions: e.target.value}))}
                            rows={2}
                            placeholder="e.g., 'Emphasize the team's background in AI.' or 'Rewrite the summary for a non-technical audience.'"
                            className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-300 mb-2">Sections & Weights</h3>
                         <p className="text-sm text-gray-400 mb-3">Enable sections and adjust their importance. The AI will prioritize content based on these weights.</p>
                        <div className="space-y-3">
                            {prefs.sections.map((section, index) => (
                                <div key={index} className="flex items-center gap-4 bg-[rgba(255,255,255,0.08)] p-3 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={section.enabled}
                                        onChange={() => handleSectionToggle(index)}
                                        className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                                    />
                                    <span className="flex-grow text-white text-sm">{section.name}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="30"
                                        step="1"
                                        value={section.weight}
                                        onChange={(e) => handleWeightChange(index, parseInt(e.target.value))}
                                        disabled={!section.enabled}
                                        className="w-32"
                                    />
                                    <span className={`w-12 text-right font-mono text-sm ${section.enabled ? 'text-white' : 'text-gray-500'}`}>
                                        {section.weight}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end flex-shrink-0">
                    <button onClick={handleSave} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
                        {saveButtonText || "Save Preferences"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPreferencesModal;