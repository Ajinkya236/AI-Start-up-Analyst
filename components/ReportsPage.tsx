import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Report } from '../App';
import { PlusIcon, SearchIcon, ChevronDownIcon, MoreVerticalIcon, EditIcon, TrashIcon, XIcon, FileTextIcon } from './icons/Icons';

type SortOption = 'lastEditedDesc' | 'lastEditedAsc' | 'titleAsc' | 'titleDesc';

// Confirmation Modal Component
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]">
      <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-md m-4">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-[rgba(255,255,255,0.8)] mb-8">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-white bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg hover:bg-[rgba(255,255,255,0.15)] transition-all duration-300">
            No
          </button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm font-medium text-white bg-red-600/80 border border-red-500/50 rounded-lg hover:bg-red-500/80 transition-all duration-300">
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

// FIX: Corrected the Omit type to match the properties expected by the handleCreateReport function in App.tsx.
// The object created in handleSubmit only has title, companyName, description, and founder.
// The other properties are added in the App component.
type CreateReportData = Omit<Report, 'id' | 'lastEdited' | 'currentStage' | 'dataSources' | 'founderVoice' | 'founderBehaviourTest' | 'investmentMemo' | 'curatedMemo'>;

// Create Report Modal Component
const CreateReportModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreateReport: (data: CreateReportData) => void;
}> = ({ isOpen, onClose, onCreateReport }) => {
    const [companyName, setCompanyName] = useState('');
    const [description, setDescription] = useState('');
    const [founderPhone, setFounderPhone] = useState('');
    const [founderEmail, setFounderEmail] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const crmData: { [key: string]: any } = {
        'Innovate Capital': { description: 'AI-driven solutions for renewable energy sector.', founderPhone: '+14155552671', founderEmail: 'founder@innovate.com', confidence: 0.92 },
        'NextGen Ventures': { description: 'Pioneering advancements in biotech.', founderPhone: '+14155552678', founderEmail: 'contact@nextgen.vc', confidence: 0.88 },
    };

    useEffect(() => {
        if(companyName in crmData) {
            const data = crmData[companyName];
            if(data.confidence > 0.7) {
                setDescription(data.description);
                setFounderPhone(data.founderPhone);
                setFounderEmail(data.founderEmail);
            }
        }
    }, [companyName]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!companyName) newErrors.companyName = 'Company Name is required.';
        if (!founderPhone) newErrors.founderPhone = 'Founder Phone is required.';
        if (!founderEmail) newErrors.founderEmail = 'Founder Email is required.';
        else if (!/\S+@\S+\.\S+/.test(founderEmail)) newErrors.founderEmail = 'Email is invalid.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            onCreateReport({
                title: `${companyName} Analysis`,
                companyName,
                description,
                founder: { phone: founderPhone, email: founderEmail }
            });
            onClose();
            // Reset form
            setCompanyName('');
            setDescription('');
            setFounderPhone('');
            setFounderEmail('');
            setErrors({});
        }
    };

    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100]" onClick={onClose}>
        <div className="bg-[rgba(20,25,30,0.9)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-8 shadow-2xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
           <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create New Report</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                    <XIcon />
                </button>
           </div>
           <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Company Name</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Search or enter company name..." className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                    {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Description (Optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                 <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Founder Phone</label>
                    <input type="tel" value={founderPhone} onChange={e => setFounderPhone(e.target.value)} placeholder="+1 (555) 123-4567" className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                     {errors.founderPhone && <p className="text-red-400 text-xs mt-1">{errors.founderPhone}</p>}
                </div>
                 <div>
                    <label className="text-sm font-medium text-[rgba(255,255,255,0.7)]">Founder Email</label>
                    <input type="email" value={founderEmail} onChange={e => setFounderEmail(e.target.value)} placeholder="founder@company.com" className="w-full mt-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.2)] rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                    {errors.founderEmail && <p className="text-red-400 text-xs mt-1">{errors.founderEmail}</p>}
                </div>
           </div>
           <div className="mt-8 flex justify-end">
                <button onClick={handleSubmit} className="px-6 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors">Next</button>
           </div>
        </div>
      </div>
    );
};

// Report Card Component
const ReportCard: React.FC<{
    report: Report;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: Partial<Pick<Report, 'title'>>) => void;
}> = ({ report, onSelect, onDelete, onUpdate }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(report.title);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleTitleSave = () => {
        if (newTitle.trim()) {
            onUpdate(report.id, { title: newTitle });
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-2xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 shadow-lg transition-transform duration-300 hover:-translate-y-2 flex flex-col justify-between cursor-pointer" onClick={() => !isEditing && onSelect(report.id)}>
            <div>
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                            className="w-full bg-transparent border-b-2 border-blue-500 text-xl font-bold text-white mb-2 outline-none"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                        />
                    ) : (
                        <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
                    )}
                    <div className="relative" ref={menuRef}>
                        <button onClick={(e) => {e.stopPropagation(); setMenuOpen(prev => !prev);}} className="p-1 rounded-full text-gray-400 hover:bg-[rgba(255,255,255,0.1)] hover:text-white">
                            <MoreVerticalIcon />
                        </button>
                        {menuOpen && (
                            <div className="absolute top-8 right-0 bg-[rgba(30,42,58,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-lg shadow-2xl w-40 z-50">
                                <button onClick={(e) => { e.stopPropagation(); setIsEditing(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-t-lg">
                                    <EditIcon className="w-4 h-4" /> Edit Title
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(report.id); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-red-400 hover:bg-[rgba(255,255,255,0.1)] rounded-b-lg">
                                    <TrashIcon className="w-4 h-4 text-red-400" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-[rgba(255,255,255,0.7)] text-sm line-clamp-2">{report.description}</p>
            </div>
            <p className="text-xs text-[rgba(255,255,255,0.5)] mt-4">
                Last edited: {new Date(report.lastEdited).toLocaleDateString()}
            </p>
        </div>
    );
};


// Main Reports Page Component
interface ReportsPageProps {
  reports: Report[];
  onSelectReport: (id: string) => void;
  onCreateReport: (data: CreateReportData) => void;
  onDeleteReport: (id: string) => void;
  onUpdateReport: (id: string, data: Partial<Pick<Report, 'title'>>) => void;
  onGoHome: () => void;
}

const ReportsPage: React.FC<ReportsPageProps> = ({ reports, onSelectReport, onCreateReport, onDeleteReport, onUpdateReport, onGoHome }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOption>('lastEditedDesc');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const filteredAndSortedReports = useMemo(() => {
    const filtered = reports.filter(report =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.founder.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'lastEditedAsc': return new Date(a.lastEdited).getTime() - new Date(b.lastEdited).getTime();
        case 'lastEditedDesc': return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
        case 'titleAsc': return a.title.localeCompare(b.title);
        case 'titleDesc': return b.title.localeCompare(a.title);
        default: return 0;
      }
    });
  }, [reports, searchTerm, sortOrder]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div onClick={onGoHome} className="absolute top-8 left-8 text-2xl font-bold cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        VentureAnalytica AI
      </div>

      <div className="container mx-auto max-w-7xl mt-24">
        <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
                My Reports
            </h1>
            <p className="text-lg text-gray-400">Manage, search, and create your startup evaluation reports.</p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-3 mb-8">
            <div className="relative flex-grow">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search reports by title, company..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-full pl-11 pr-4 py-3 text-white placeholder:text-[rgba(255,255,255,0.5)] outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="flex items-center gap-3">
                 <div className="relative">
                    <select
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value as SortOption)}
                        className="appearance-none w-full md:w-auto bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-lg pl-4 pr-10 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="lastEditedDesc">Sort by: Last Edited</option>
                        <option value="lastEditedAsc">Sort by: Oldest</option>
                        <option value="titleAsc">Sort by: Title (A-Z)</option>
                        <option value="titleDesc">Sort by: Title (Z-A)</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 w-full md:w-auto font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                >
                    <PlusIcon /> New Report
                </button>
            </div>
        </div>

        {filteredAndSortedReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedReports.map(report => (
                    <ReportCard
                        key={report.id}
                        report={report}
                        onSelect={onSelectReport}
                        onDelete={() => setReportToDelete(report.id)}
                        onUpdate={onUpdateReport}
                    />
                ))}
            </div>
        ) : (
             <div className="text-center py-24">
                <div className="inline-block p-4 bg-[rgba(255,255,255,0.1)] rounded-full mb-4">
                    <FileTextIcon className="w-10 h-10 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">No reports found</h3>
                <p className="text-gray-400 mt-2">{searchTerm ? 'Try adjusting your search or create a new report.' : 'Click "New Report" to analyze your first startup.'}</p>
            </div>
        )}

      </div>
      <CreateReportModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onCreateReport={onCreateReport} />
      <ConfirmationModal
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirm={() => {
            if(reportToDelete) {
                onDeleteReport(reportToDelete);
                setReportToDelete(null);
            }
        }}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
      />
    </div>
  );
};

export default ReportsPage;
