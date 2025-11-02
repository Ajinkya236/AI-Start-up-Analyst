
import React, { useState, useEffect } from 'react';
import { Report } from '../App';
import { PlusIcon, SearchIcon, MoreVerticalIcon, EditIcon, TrashIcon, BuildingOfficeIcon, UserPlusIcon, ChevronLeftIcon } from './icons/Icons';
import { countryCodes } from './founder/countryCodes';

interface ReportsPageProps {
  reports: Report[];
  onSelectReport: (id: string) => void;
  onAddReport: (reportData: {companyName: string, description?: string, founderPhone: string, founderEmail: string}) => void;
  onDeleteReport: (id: string) => void;
  onCreateFromRegistered: (sourceReportId: string) => void;
}

const NewReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddReport: (reportData: {companyName: string, description?: string, founderPhone: string, founderEmail: string}) => void;
  onCreateFromRegistered: (sourceReportId: string) => void;
  reports: Report[];
}> = ({ isOpen, onClose, onAddReport, onCreateFromRegistered, reports }) => {
  
  const [step, setStep] = useState<'choose' | 'unregistered' | 'registered'>('choose');
  
  // State for unregistered form
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [founderEmail, setFounderEmail] = useState('');
  
  // State for registered form
  const [searchTerm, setSearchTerm] = useState('');
  const founderSubmissions = reports.filter(r => r.id.startsWith('rep-founder-'));
  const filteredSubmissions = founderSubmissions.filter(r => 
    r.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
        // Reset state when opening
        setStep('choose');
        setCompanyName('');
        setDescription('');
        setCountryCode('+1');
        setPhone('');
        setFounderEmail('');
        setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnregisteredSubmit = () => {
    if (companyName.trim()) {
      onAddReport({
        companyName,
        description,
        founderPhone: `${countryCode}${phone}`,
        founderEmail
      });
      onClose();
    }
  };

  const handleRegisteredSelect = (reportId: string) => {
    onCreateFromRegistered(reportId);
    onClose();
  }
  
  const renderContent = () => {
    switch(step) {
        case 'registered':
            return (
                <div>
                     <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4">
                        <ChevronLeftIcon className="w-4 h-4" /> Back
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-4">New Report from Registered Company</h2>
                    <p className="text-gray-400 mb-6">Select a company that has already submitted their data through the founder portal.</p>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Search by company name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <ul className="mt-4 max-h-60 overflow-y-auto space-y-2 pr-2">
                        {filteredSubmissions.map(report => (
                            <li key={report.id} onClick={() => handleRegisteredSelect(report.id)} className="p-3 rounded-lg hover:bg-blue-600/20 cursor-pointer transition-colors border border-transparent hover:border-blue-500/30">
                                <p className="font-semibold text-white">{report.companyName}</p>
                                <p className="text-xs text-gray-400">Submitted on: {new Date(report.date).toLocaleDateString()}</p>
                            </li>
                        ))}
                        {filteredSubmissions.length === 0 && <p className="text-center text-gray-500 p-4">No matching submissions found.</p>}
                    </ul>
                </div>
            )
        case 'unregistered':
            return (
                 <div>
                    <button onClick={() => setStep('choose')} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4">
                        <ChevronLeftIcon className="w-4 h-4" /> Back
                    </button>
                    <h2 className="text-2xl font-bold text-white mb-6">New Report from Unregistered Company</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300">Company Name</label>
                            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., QuantumLeap Inc."/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Company Description (Optional)</label>
                             <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="A brief one-liner about the company."/>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-300">Founder Phone (Optional)</label>
                            <div className="flex items-center mt-1">
                                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="bg-[rgba(255,255,255,0.08)] border border-r-0 border-[rgba(255,255,255,0.2)] rounded-l-lg px-3 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                                    {countryCodes.map(c => <option key={c.code} value={c.dial_code}>{c.code} {c.dial_code}</option>)}
                                </select>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-r-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Founder's Email (Optional)</label>
                            <input type="email" value={founderEmail} onChange={(e) => setFounderEmail(e.target.value)} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="founder@example.com"/>
                            <p className="text-xs text-gray-500 mt-1">Used for sending founder interview and test links.</p>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleUnregisteredSubmit} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
                            Create Report
                        </button>
                    </div>
                </div>
            )
        case 'choose':
        default:
            return (
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Report</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onClick={() => setStep('registered')} className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-2xl p-6 text-center hover:bg-blue-600/20 hover:border-blue-500/50 cursor-pointer transition-all">
                            <BuildingOfficeIcon className="w-10 h-10 mx-auto mb-3 text-blue-400"/>
                            <h3 className="font-semibold text-white">From a Registered Company</h3>
                            <p className="text-sm text-gray-400">Use data from a founder who has already completed the submission process.</p>
                        </div>
                        <div onClick={() => setStep('unregistered')} className="bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-2xl p-6 text-center hover:bg-purple-600/20 hover:border-purple-500/50 cursor-pointer transition-all">
                            <UserPlusIcon className="w-10 h-10 mx-auto mb-3 text-purple-400"/>
                             <h3 className="font-semibold text-white">From an Unregistered Company</h3>
                            <p className="text-sm text-gray-400">Manually enter the initial details for a company you're tracking.</p>
                        </div>
                    </div>
                </div>
            )
    }
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
       {renderContent()}
      </div>
    </div>
  );
};


const ReportsPage: React.FC<ReportsPageProps> = ({ reports, onSelectReport, onAddReport, onDeleteReport, onCreateFromRegistered }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredReports = reports.filter(r => 
    !r.id.startsWith('rep-founder-') && // Don't show raw founder submissions here
    (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <NewReportModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onAddReport={onAddReport} onCreateFromRegistered={onCreateFromRegistered} reports={reports} />
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Investment Reports</h1>
            <p className="text-lg text-gray-400">Manage and analyze your deal flow.</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">
            <PlusIcon /> New Report
          </button>
        </header>

        <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
            <input 
                type="text"
                placeholder="Search reports by company or title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[rgba(255,255,255,0.1)]">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-300">Company</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 hidden md:table-cell">Stage</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 hidden sm:table-cell">Date Created</th>
                  <th className="p-4 text-sm font-semibold text-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <ReportRow 
                        key={report.id} 
                        report={report} 
                        onSelectReport={onSelectReport}
                        onDeleteReport={onDeleteReport}
                    />
                  ))
                ) : (
                    <tr>
                        <td colSpan={4} className="text-center p-8 text-gray-500">No analyst reports found. Create one to get started.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportRow: React.FC<{report: Report; onSelectReport: (id: string) => void; onDeleteReport: (id: string) => void}> = ({report, onSelectReport, onDeleteReport}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const stageNames = ["Data Collection", "Investment Memo", "Curated Memo"];
    const stageColors = ["bg-yellow-500", "bg-blue-500", "bg-green-500"];

    return (
        <tr className="border-b border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer" onClick={() => onSelectReport(report.id)}>
            <td className="p-4">
                <p className="font-bold text-white">{report.companyName}</p>
                <p className="text-sm text-gray-400">{report.title}</p>
            </td>
            <td className="p-4 hidden md:table-cell">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full text-white ${stageColors[report.currentStage]}`}>
                    {stageNames[report.currentStage]}
                </span>
            </td>
            <td className="p-4 text-sm text-gray-400 hidden sm:table-cell">
                {new Date(report.date).toLocaleDateString()}
            </td>
            <td className="p-4 text-right">
                <div className="relative" ref={menuRef}>
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                        <MoreVerticalIcon className="w-5 h-5 text-gray-300" />
                    </button>
                    {menuOpen && (
                        <div className="absolute top-10 right-0 bg-[rgba(30,42,58,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-lg shadow-2xl w-40 z-10">
                            <button onClick={(e) => { e.stopPropagation(); onSelectReport(report.id); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-t-lg">
                                <EditIcon className="w-4 h-4" /> Open
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteReport(report.id); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-red-400 hover:bg-[rgba(255,255,255,0.1)] rounded-b-lg">
                                <TrashIcon className="w-4 h-4 text-red-400" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}

export default ReportsPage;
