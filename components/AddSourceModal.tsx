import React, { useState, useEffect } from 'react';
import { XIcon, LinkIcon, UploadIcon, FileTextIcon, LoaderIcon, YoutubeIcon, ImageIcon } from './icons/Icons';
import { DataSource } from '../App';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (source: Omit<DataSource, 'id' | 'status' | 'isSelected'>) => void;
}

type SourceType = 'url' | 'file' | 'text' | 'youtube' | 'image';

const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onAddSource }) => {
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
        resetForm();
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    switch (sourceType) {
        case 'url':
        case 'youtube':
            if (!url) newErrors.url = 'URL cannot be empty.';
            else {
                try {
                    new URL(url);
                } catch (_) {
                    newErrors.url = 'Please enter a valid URL.';
                }
            }
            break;
        case 'text':
            if (!text.trim()) newErrors.text = 'Text content cannot be empty.';
            break;
        case 'file':
        case 'image':
            if (!file) newErrors.file = 'Please select a file to upload.';
            break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    let sourceToAdd;

    if (sourceType === 'url' && url) {
        sourceToAdd = { type: 'url' as const, content: url, filename: url };
    } else if (sourceType === 'youtube' && url) {
        sourceToAdd = { type: 'youtube' as const, content: url, filename: url };
    } else if (sourceType === 'text' && text) {
        sourceToAdd = { type: 'text' as const, content: text, filename: `Pasted Text: ${text.substring(0, 20)}...` };
    } else if ((sourceType === 'file' || sourceType === 'image') && file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        onAddSource({
          type: sourceType,
          content: reader.result as string,
          filename: file.name
        });
        setIsLoading(false);
        onClose();
      };
      reader.onerror = () => {
        setIsLoading(false);
        setErrors({ file: 'Failed to read file.' });
      }
      return;
    }

    if(sourceToAdd) {
        onAddSource(sourceToAdd);
    }
    setIsLoading(false);
    onClose();
  };
  
  const resetForm = () => {
      setUrl('');
      setText('');
      setFile(null);
      setErrors({});
  }

  const handleClose = () => {
    onClose();
  }
  
  useEffect(() => {
    resetForm();
  }, [sourceType]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch(sourceType) {
      case 'url':
      case 'youtube':
        return (
            <div>
                <input type="url" value={url} onChange={e => { setUrl(e.target.value); setErrors({}); }} placeholder={sourceType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : "https://example.com"} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                {errors.url && <p className="text-red-400 text-xs mt-1">{errors.url}</p>}
            </div>
        );
      case 'text':
        return (
            <div>
                <textarea value={text} onChange={e => { setText(e.target.value); setErrors({}); }} rows={5} placeholder="Paste your text here..." className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                {errors.text && <p className="text-red-400 text-xs mt-1">{errors.text}</p>}
            </div>
        );
      case 'file':
      case 'image':
        return (
          <div>
            <div className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-8 text-white text-center">
                <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} accept={sourceType === 'image' ? 'image/*' : undefined} />
                <label htmlFor="file-upload" className="cursor-pointer">
                <UploadIcon className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                {file ? <span>{file.name}</span> : <span>Click to browse or drag & drop</span>}
                {sourceType === 'image' && <p className="text-xs text-gray-500 mt-1">(.png, .jpg, .gif)</p>}
                </label>
            </div>
             {errors.file && <p className="text-red-400 text-xs mt-1 text-center">{errors.file}</p>}
          </div>
        );
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={handleClose}>
      <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Data Source</h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
            <XIcon />
          </button>
        </div>
        
        <div className="flex flex-wrap border border-[rgba(255,255,255,0.2)] rounded-lg p-1 mb-6">
          <button onClick={() => setSourceType('url')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'url' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><LinkIcon className="w-4 h-4"/> URL</button>
          <button onClick={() => setSourceType('youtube')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'youtube' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><YoutubeIcon className="w-4 h-4"/> YouTube</button>
          <button onClick={() => setSourceType('file')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'file' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><UploadIcon className="w-4 h-4"/> File</button>
          <button onClick={() => setSourceType('image')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'image' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><ImageIcon className="w-4 h-4"/> Image</button>
          <button onClick={() => setSourceType('text')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'text' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><FileTextIcon className="w-4 h-4"/> Text</button>
        </div>

        <div>{renderContent()}</div>

        <div className="mt-8 flex justify-end">
          <button onClick={handleSubmit} disabled={isLoading} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-blue-800 disabled:cursor-not-allowed w-32 flex items-center justify-center">
            {isLoading ? <LoaderIcon /> : 'Add Source'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSourceModal;