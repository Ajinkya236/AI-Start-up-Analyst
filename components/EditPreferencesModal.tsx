import React, { useState } from 'react';
import { Report } from '../App';
import { XIcon } from './icons/Icons';

// FIX: Added full implementation of EditPreferencesModal.tsx to allow customization of the memo generation.

interface EditPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    preferences: Report['investmentMemo']['preferences'];
    onSave: (newPreferences: Report['investmentMemo']['preferences']) => void;
}

const EditPreferencesModal: React.FC<EditPreferencesModalProps> = ({ isOpen, onClose, preferences, onSave }) => {
  const [currentPrefs, setCurrentPrefs] = useState(preferences);

  if (!isOpen) return null;

  const handleSectionToggle = (sectionName: string) => {
    setCurrentPrefs(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.name === sectionName ? {...s, enabled: !s.enabled} : s)
    }));
  };
  
  const handleWeightChange = (sectionName: string, weight: number) => {
    setCurrentPrefs(prev => ({
        ...prev,
        sections: prev.sections.map(s => s.name === sectionName ? {...s, weight} : s)
    }));
  };

  const handleSave = () => {
    onSave(currentPrefs);
    onClose();
  };
  
  type PrefButtonProps<T> = {
      label: string;
      value: T;
      currentValue: T;
      setter: (value: T) => void;
  }

  const PrefButton = <T extends string>({label, value, currentValue, setter}: PrefButtonProps<T>) => (
    <button
      onClick={() => setter(value)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        currentValue === value ? 'bg-blue-600 text-white' : 'bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Memo Preferences</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
            <XIcon />
          </button>
        </div>
        
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Memo Tone</h3>
                <div className="flex gap-2">
                    <PrefButton label="Formal" value="Formal" currentValue={currentPrefs.tone} setter={(v) => setCurrentPrefs(p => ({...p, tone: v}))} />
                    <PrefButton label="Balanced" value="Balanced" currentValue={currentPrefs.tone} setter={(v) => setCurrentPrefs(p => ({...p, tone: v}))} />
                    <PrefButton label="Bullish" value="Bullish" currentValue={currentPrefs.tone} setter={(v) => setCurrentPrefs(p => ({...p, tone: v}))} />
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-white mb-2">Memo Length</h3>
                <div className="flex gap-2">
                    <PrefButton label="Concise" value="Concise" currentValue={currentPrefs.length} setter={(v) => setCurrentPrefs(p => ({...p, length: v}))} />
                    <PrefButton label="Standard" value="Standard" currentValue={currentPrefs.length} setter={(v) => setCurrentPrefs(p => ({...p, length: v}))} />
                    <PrefButton label="Detailed" value="Detailed" currentValue={currentPrefs.length} setter={(v) => setCurrentPrefs(p => ({...p, length: v}))} />
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Sections &amp; Weights</h3>
                <p className="text-sm text-gray-400 mb-3">Enable sections and adjust their importance in the final memo.</p>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {currentPrefs.sections.map(section => (
                        <div key={section.name} className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.08)] rounded-lg">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                                    checked={section.enabled}
                                    onChange={() => handleSectionToggle(section.name)}
                                />
                                <span className={section.enabled ? 'text-white' : 'text-gray-500'}>{section.name}</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="25" 
                                    value={section.weight}
                                    onChange={e => handleWeightChange(section.name, parseInt(e.target.value, 10))}
                                    disabled={!section.enabled}
                                    className="w-32"
                                />
                                <span className={`text-sm w-6 text-right ${section.enabled ? 'text-blue-300' : 'text-gray-600'}`}>{section.weight}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
            Save &amp; Regenerate
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPreferencesModal;
