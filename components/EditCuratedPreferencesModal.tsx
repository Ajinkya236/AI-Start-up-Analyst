import React, { useState } from 'react';
// FIX: The App.tsx file is now a proper module, so this import will work.
import { Report } from '../App';
import { XIcon } from './icons/Icons';

// FIX: Added full implementation of EditCuratedPreferencesModal.tsx to allow customization of the final memo.

interface EditCuratedPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    preferences: Report['curatedMemo']['preferences'];
    onSave: (newPreferences: Report['curatedMemo']['preferences']) => void;
}

const EditCuratedPreferencesModal: React.FC<EditCuratedPreferencesModalProps> = ({ isOpen, onClose, preferences, onSave }) => {
  const [currentPrefs, setCurrentPrefs] = useState(preferences);

  if (!isOpen) return null;

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
      <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Curated Memo Preferences</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
            <XIcon />
          </button>
        </div>
        
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-2">Target Audience</h3>
                <div className="flex gap-2">
                    <PrefButton label="Internal" value="Internal" currentValue={currentPrefs.audience} setter={(v) => setCurrentPrefs(p => ({...p, audience: v}))} />
                    <PrefButton label="LP Facing" value="LP" currentValue={currentPrefs.audience} setter={(v) => setCurrentPrefs(p => ({...p, audience: v}))} />
                    <PrefButton label="External" value="External" currentValue={currentPrefs.audience} setter={(v) => setCurrentPrefs(p => ({...p, audience: v}))} />
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold text-white mb-2">Export Format</h3>
                <div className="flex gap-2">
                    <PrefButton label="Markdown" value="Markdown" currentValue={currentPrefs.format} setter={(v) => setCurrentPrefs(p => ({...p, format: v}))} />
                    <PrefButton label="PDF" value="PDF" currentValue={currentPrefs.format} setter={(v) => setCurrentPrefs(p => ({...p, format: v}))} />
                    <PrefButton label="DOCX" value="DOCX" currentValue={currentPrefs.format} setter={(v) => setCurrentPrefs(p => ({...p, format: v}))} />
                </div>
            </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button onClick={handleSave} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCuratedPreferencesModal;
