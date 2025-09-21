import React, { useState } from 'react';
import { XIcon, LinkIcon, UploadIcon, FileTextIcon, LoaderIcon } from './icons/Icons';
import { DataSource } from '../App';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Corrected the Omit type to exclude `isSelected`, which is handled by the parent component.
  onAddSource: (source: Omit<DataSource, 'id' | 'status' | 'isSelected'>) => void;
}

type SourceType = 'url' | 'file' | 'text';

const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onAddSource }) => {
  const [sourceType, setSourceType] = useState<SourceType>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    let sourceToAdd;

    if (sourceType === 'url' && url) {
        sourceToAdd = { type: 'url', content: url, filename: url };
    } else if (sourceType === 'text' && text) {
        sourceToAdd = { type: 'text', content: text, filename: `Pasted Text: ${text.substring(0, 20)}...` };
    } else if (sourceType === 'file' && file) {
      // In a real app, you'd upload this and get a URL/ID.
      // For this demo, we'll simulate reading it as a base64 string.
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        onAddSource({
          type: 'file',
          content: reader.result as string,
          filename: file.name
        });
        setIsLoading(false);
        onClose();
        resetForm();
      };
      reader.onerror = () => {
        setIsLoading(false);
        // handle error
      }
      return; // return early because of async file reading
    }

    if(sourceToAdd) {
        onAddSource(sourceToAdd);
    }
    setIsLoading(false);
    onClose();
    resetForm();
  };
  
  const resetForm = () => {
      setUrl('');
      setText('');
      setFile(null);
      setSourceType('url');
  }

  const handleClose = () => {
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  const renderContent = () => {
    switch(sourceType) {
      case 'url':
        return <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />;
      case 'text':
        return <textarea value={text} onChange={e => setText(e.target.value)} rows={5} placeholder="Paste your text here..." className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" />;
      case 'file':
        return (
          <div className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-8 text-white text-center">
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
            <label htmlFor="file-upload" className="cursor-pointer">
              <UploadIcon className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              {file ? <span>{file.name}</span> : <span>Click to browse or drag & drop</span>}
            </label>
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
        
        <div className="flex border border-[rgba(255,255,255,0.2)] rounded-lg p-1 mb-6">
          <button onClick={() => setSourceType('url')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'url' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><LinkIcon/> URL</button>
          <button onClick={() => setSourceType('file')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'file' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><UploadIcon/> File</button>
          <button onClick={() => setSourceType('text')} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${sourceType === 'text' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[rgba(255,255,255,0.1)]'}`}><FileTextIcon/> Text</button>
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
