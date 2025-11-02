<script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"></script>
import React, { useState, useEffect } from 'react';
import { DataSource } from '../../App';
import { UploadIcon, XIcon } from '../icons/Icons';
import { countryCodes } from './countryCodes';

interface Step1CompanyInfoProps {
    initialData: {
        companyName: string, 
        description: string, 
        founderPhone: string, 
        founderEmail: string,
        files: DataSource[]
    };
    onComplete: (data: { 
        companyName: string, 
        description: string, 
        founderPhone: string, 
        founderEmail: string,
        files: DataSource[]
    }) => void;
}

const Step1CompanyInfo: React.FC<Step1CompanyInfoProps> = ({ initialData, onComplete }) => {
    const [companyName, setCompanyName] = useState(initialData.companyName);
    const [description, setDescription] = useState(initialData.description);
    const [countryCode, setCountryCode] = useState('+1');
    const [phone, setPhone] = useState('');
    const [founderEmail, setFounderEmail] = useState(initialData.founderEmail);
    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<DataSource[]>(initialData.files);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // Pre-fill phone number if available
        if (initialData.founderPhone) {
            const code = countryCodes.find(c => initialData.founderPhone.startsWith(c.dial_code));
            if (code) {
                setCountryCode(code.dial_code);
                setPhone(initialData.founderPhone.substring(code.dial_code.length));
            } else {
                setPhone(initialData.founderPhone);
            }
        }
    }, [initialData.founderPhone]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!companyName) newErrors.companyName = 'Company Name is required.';
        if (!phone) newErrors.founderPhone = 'Founder Phone is required.';
        if (!founderEmail) newErrors.founderEmail = 'Founder Email is required.';
        else if (!/\S+@\S+\.\S+/.test(founderEmail)) newErrors.founderEmail = 'Email is invalid.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleRemoveNewFile = (indexToRemove: number) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveExistingFile = (idToRemove: string) => {
        setExistingFiles(prev => prev.filter(file => file.id !== idToRemove));
    }

    const handleSubmit = () => {
        if (validate()) {
            const newFileDataSources: DataSource[] = files.map((file, index) => ({
                id: `file-${Date.now()}-${index}`,
                type: 'file',
                content: `(Simulated content for ${file.name})`,
                filename: file.name,
                status: 'Completed',
                isSelected: true
            }));
            
            onComplete({
                companyName,
                description,
                founderPhone: `${countryCode}${phone}`,
                founderEmail,
                files: [...existingFiles, ...newFileDataSources]
            });
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Step 1: Company Information</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                    {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Company Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Founder Phone</label>
                    <div className="flex items-center mt-1">
                        <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="bg-[rgba(255,255,255,0.08)] border border-r-0 border-[rgba(255,255,255,0.2)] rounded-l-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                            {countryCodes.map(c => <option key={c.code} value={c.dial_code}>{c.code} {c.dial_code}</option>)}
                        </select>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-r-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                    </div>
                     {errors.founderPhone && <p className="text-red-400 text-xs mt-1">{errors.founderPhone}</p>}
                </div>
                 <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Founder Email</label>
                    <input type="email" value={founderEmail} onChange={e => setFounderEmail(e.target.value)} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                    {errors.founderEmail && <p className="text-red-400 text-xs mt-1">{errors.founderEmail}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Relevant Documents (Pitch Deck, etc.)</label>
                     <div className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-8 text-white text-center">
                        <input type="file" id="file-upload" multiple className="hidden" onChange={handleFileChange} />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <UploadIcon className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                          <span>Click to browse or drag & drop files</span>
                        </label>
                      </div>
                      <ul className="mt-2 space-y-2">
                        {existingFiles.map((file) => (
                          <li key={file.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded text-sm text-gray-300">
                             <span className="truncate">{file.filename}</span>
                             <button onClick={() => handleRemoveExistingFile(file.id)} className="p-1 rounded-full hover:bg-red-500/20 flex-shrink-0">
                                <XIcon className="w-4 h-4 text-red-400"/>
                            </button>
                          </li>
                        ))}
                        {files.map((file, i) => (
                          <li key={i} className="flex items-center justify-between bg-gray-700/50 p-2 rounded text-sm text-gray-300">
                            <span className="truncate">{file.name}</span>
                            <button onClick={() => handleRemoveNewFile(i)} className="p-1 rounded-full hover:bg-red-500/20 flex-shrink-0">
                                <XIcon className="w-4 h-4 text-red-400"/>
                            </button>
                          </li>
                        ))}
                      </ul>
                </div>
           </div>
           <div className="mt-8 flex justify-end">
                <button onClick={handleSubmit} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">Next: Voice Interview</button>
           </div>
        </div>
    );
};

export default Step1CompanyInfo;