import React, { useState, useEffect, useRef } from 'react';
import { Report, DataSource, AgentStatus } from '../App';
import AddSourceModal from './AddSourceModal';
import DeepResearchModal from './DeepResearchModal';
import { PlusIcon, LinkIcon, FileTextIcon, UploadIcon, CheckCircleIcon, XCircleIcon, LoaderIcon, TrashIcon, MicIcon, UserCheckIcon, SparklesIcon, MoreVerticalIcon, EditIcon, YoutubeIcon, ImageIcon } from './icons/Icons';

const AgentStatusIndicator = ({ status }: { status: AgentStatus }) => {
    switch (status) {
        case 'pending': return <div className="flex items-center gap-1 text-xs text-yellow-400"><LoaderIcon className="w-3 h-3 animate-spin" /> Pending</div>;
        case 'completed': return <div className="flex items-center gap-1 text-xs text-green-400"><CheckCircleIcon className="w-3 h-3" /> Completed</div>;
        default: return <div className="text-xs text-gray-500">Not Started</div>;
    }
};

const SourceStatusIcon = ({ status }: { status: DataSource['status'] }) => {
    switch (status) {
        case 'Pending': return <LoaderIcon className="w-5 h-5 text-yellow-400 animate-spin" />;
        case 'Processing': return <LoaderIcon className="w-5 h-5 text-blue-400 animate-spin" />;
        case 'Completed': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
        case 'Failed': return <XCircleIcon className="w-5 h-5 text-red-400" />;
        default: return null;
    }
};

const SourceTypeIcon = ({ type }: { type: DataSource['type'] }) => {
    switch (type) {
        case 'url': return <LinkIcon className="w-5 h-5 text-gray-400" />;
        case 'youtube': return <YoutubeIcon className="w-5 h-5 text-red-400" />;
        case 'file': return <UploadIcon className="w-5 h-5 text-gray-400" />;
        case 'image': return <ImageIcon className="w-5 h-5 text-gray-400" />;
        case 'text': return <FileTextIcon className="w-5 h-5 text-gray-400" />;
        case 'transcript': return <MicIcon className="w-5 h-5 text-gray-400" />;
        case 'assessment': return <UserCheckIcon className="w-5 h-5 text-gray-400" />;
        case 'research': return <SparklesIcon className="w-5 h-5 text-gray-400" />;
        default: return null;
    }
}

interface AgentActionCardProps {
    icon: React.ReactNode;
    title: string;
    status: AgentStatus;
    lastTriggered?: string;
    onTrigger: () => void;
    disabled?: boolean;
    ctaText?: string;
}

const AgentActionCard: React.FC<AgentActionCardProps> = ({ icon, title, status, lastTriggered, onTrigger, disabled, ctaText }) => (
    <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-2xl p-4 flex flex-col justify-between">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[rgba(255,255,255,0.1)] rounded-lg">{icon}</div>
                <h3 className="font-bold text-white">{title}</h3>
            </div>
            <div className="pl-1">
                <AgentStatusIndicator status={status} />
                {lastTriggered && <p className="text-xs text-gray-500 mt-1">Last run: {new Date(lastTriggered).toLocaleString()}</p>}
            </div>
        </div>
        <button
            onClick={onTrigger}
            disabled={disabled || status === 'pending'}
            className="w-full mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
            {status === 'pending' ? 'Running...' : ctaText || 'Trigger Agent'}
        </button>
    </div>
);


interface Stage0DataCollectionProps {
  report: Report;
  onUpdateReport: (id: string, data: Partial<Report>) => void;
  onNextStage: () => void;
}

const Stage0DataCollection: React.FC<Stage0DataCollectionProps> = ({ report, onUpdateReport, onNextStage }) => {
  const [isAddSourceModalOpen, setAddSourceModalOpen] = useState(report.dataSources.length === 0);
  const [isResearchModalOpen, setResearchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const prevDataSourcesLength = useRef(report.dataSources.length);
  
  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(''), 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (prevDataSourcesLength.current > 0 && report.dataSources.length === 0) {
        setAddSourceModalOpen(true);
    }
    prevDataSourcesLength.current = report.dataSources.length;
  }, [report.dataSources.length]);


  const handleAddSource = (source: Omit<DataSource, 'id' | 'status' | 'isSelected'>) => {
    const newSource: DataSource = {
        ...source,
        id: `ds-${Date.now()}`,
        status: 'Pending',
        isSelected: true,
    };
    onUpdateReport(report.id, {
        dataSources: [...report.dataSources, newSource]
    });
  };
  
  const handleAddDataSource = (source: Omit<DataSource, 'id' | 'status' | 'isSelected'>) => {
    const newSource: DataSource = {
        ...source,
        id: `ds-${Date.now()}`,
        status: 'Completed',
        isSelected: true,
        summary: source.summary || (source.content ? source.content.substring(0, 100) + '...' : '')
    };
     onUpdateReport(report.id, {
        dataSources: [...report.dataSources, newSource]
    });
  }

  const handleDeleteSource = (sourceId: string) => {
    onUpdateReport(report.id, {
        dataSources: report.dataSources.filter(ds => ds.id !== sourceId)
    });
  }
  
  const handleToggleSelect = (sourceId: string) => {
      onUpdateReport(report.id, {
        dataSources: report.dataSources.map(ds => 
            ds.id === sourceId ? {...ds, isSelected: !ds.isSelected} : ds
        )
      });
  }

  const handleSelectAll = (isSelected: boolean) => {
      onUpdateReport(report.id, {
        dataSources: report.dataSources.map(ds => ({...ds, isSelected}))
      });
  }
  
  const handleRenameSource = (sourceId: string, newName: string) => {
    onUpdateReport(report.id, {
      dataSources: report.dataSources.map(ds => 
        ds.id === sourceId ? {...ds, filename: newName, content: newName } : ds
      )
    });
  }
  
  const triggerFounderVoice = () => {
    const now = new Date().toISOString();
    setToastMessage(`Email sent to ${report.founder.email} prompting them to complete the Founder Voice interview.`);
    onUpdateReport(report.id, { founderVoice: { status: 'pending', lastTriggered: now }});

    // Simulate founder completing the task later
    setTimeout(() => {
        onUpdateReport(report.id, { founderVoice: { status: 'completed', lastTriggered: now }});
        handleAddDataSource({ type: 'transcript', content: 'Founder Voice Call Transcript (Completed)', filename: 'Founder Voice Call Transcript' });
    }, 8000);
  }
  
  const triggerBehaviourTest = () => {
    const now = new Date().toISOString();
    setToastMessage(`Email sent to ${report.founder.email} prompting them to complete the Founder Behaviour Test.`);
    onUpdateReport(report.id, { founderBehaviourTest: { status: 'pending', lastTriggered: now }});
    
     setTimeout(() => {
        onUpdateReport(report.id, { founderBehaviourTest: { status: 'completed', lastTriggered: now }});
        handleAddDataSource({ type: 'assessment', content: 'Founder Psychometric Assessment Results (Completed)', filename: 'Founder Psychometric Assessment Results' });
    }, 10000);
  }

  // Simulate ingestion processing
  useEffect(() => {
    const pendingSources = report.dataSources.filter(ds => ds.status === 'Pending');
    if (pendingSources.length > 0) {
      const timer = setTimeout(() => {
        const updatedSources = report.dataSources.map((ds): DataSource => 
            ds.status === 'Pending' ? { ...ds, status: 'Processing' } : ds
        );
        onUpdateReport(report.id, { dataSources: updatedSources });
      }, 1000);
      return () => clearTimeout(timer);
    }

    const processingSources = report.dataSources.filter(ds => ds.status === 'Processing');
     if (processingSources.length > 0) {
      const timer = setTimeout(() => {
        const updatedSources = report.dataSources.map((ds): DataSource => {
            if (ds.status === 'Processing') {
                // ... (summary logic remains the same)
                 return { ...ds, status: 'Completed', summary: `Summary for ${ds.filename || ds.content.substring(0,30)}...` };
            }
            return ds;
        });
        onUpdateReport(report.id, { dataSources: updatedSources });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [report.dataSources, report.id, onUpdateReport]);

  const canProceed = report.dataSources.some(ds => ds.isSelected && ds.status === 'Completed');
  const allSelected = report.dataSources.length > 0 && report.dataSources.every(ds => ds.isSelected);
  const hasTranscript = report.dataSources.some(ds => ds.type === 'transcript');
  const hasAssessment = report.dataSources.some(ds => ds.type === 'assessment');

  return (
    <div className="max-w-5xl mx-auto relative">
        {toastMessage && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
                {toastMessage}
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AgentActionCard 
                icon={<MicIcon className="w-6 h-6 text-blue-300"/>}
                title="Founder Voice"
                status={report.founderVoice.status}
                lastTriggered={report.founderVoice.lastTriggered}
                onTrigger={triggerFounderVoice}
                disabled={!report.founder.email || report.founderVoice.status !== 'idle' || hasTranscript}
                ctaText="Send Email"
            />
             <AgentActionCard 
                icon={<UserCheckIcon className="w-6 h-6 text-purple-300"/>}
                title="Founder Behaviour Test"
                status={report.founderBehaviourTest.status}
                lastTriggered={report.founderBehaviourTest.lastTriggered}
                onTrigger={triggerBehaviourTest}
                disabled={!report.founder.email || report.founderBehaviourTest.status !== 'idle' || hasAssessment}
                ctaText="Send Email"
            />
             <AgentActionCard 
                icon={<SparklesIcon className="w-6 h-6 text-green-300"/>}
                title="Deep Research"
                status={'idle'}
                onTrigger={() => setResearchModalOpen(true)}
                ctaText="Open"
            />
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Ingested Sources</h3>
                    <p className="text-sm text-gray-400">Select sources to include in the memo generation.</p>
                </div>
                 <button
                    onClick={() => setAddSourceModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
                >
                    <PlusIcon /> Add Source
                </button>
            </div>
            
            <div className="bg-[rgba(0,0,0,0.2)] rounded-lg min-h-[200px] p-1">
                {report.dataSources.length > 0 ? (
                <>
                    <div className="px-3 py-2 flex items-center">
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                            checked={allSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-300">Select All</span>
                    </div>
                    <ul className="space-y-2 p-2">
                        {report.dataSources.map(source => (
                        <SourceItem 
                            key={source.id} 
                            source={source} 
                            onToggleSelect={handleToggleSelect}
                            onDelete={handleDeleteSource}
                            onRename={handleRenameSource}
                        />
                        ))}
                    </ul>
                </>
                ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-16">
                    <FileTextIcon className="w-10 h-10 mb-2" />
                    <p>No data sources added yet.</p>
                    <p className="text-sm">Click "Add Source" to begin.</p>
                </div>
                )}
            </div>
        </div>

      <div className="mt-8 flex justify-between items-center">
        <span className="text-sm text-gray-400">
            {report.dataSources.filter(s => s.isSelected).length} of {report.dataSources.length} sources selected.
        </span>
        <button
          onClick={onNextStage}
          disabled={!canProceed}
          className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Generate Investment Memo
        </button>
      </div>
      
      <AddSourceModal isOpen={isAddSourceModalOpen} onClose={() => setAddSourceModalOpen(false)} onAddSource={handleAddSource} />
      <DeepResearchModal isOpen={isResearchModalOpen} onClose={() => setResearchModalOpen(false)} report={report} onAddSource={handleAddDataSource} />
    </div>
  );
};


const SourceItem: React.FC<{
    source: DataSource;
    onToggleSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
}> = ({ source, onToggleSelect, onDelete, onRename }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(source.filename || source.content);
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

    const handleRename = () => {
        if(newName.trim()) {
            onRename(source.id, newName);
            setIsEditing(false);
            setMenuOpen(false);
        }
    }

    const contentDisplay = source.filename || source.content;

    return (
         <li className="flex items-center justify-between bg-[rgba(255,255,255,0.08)] p-3 rounded-lg">
            <div className="flex items-center gap-3 overflow-hidden">
                <input
                    type="checkbox"
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    checked={source.isSelected}
                    onChange={() => onToggleSelect(source.id)}
                />
                <SourceTypeIcon type={source.type}/>
                {isEditing ? (
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={e => e.key === 'Enter' && handleRename()}
                        className="bg-transparent text-white border-b border-blue-500 outline-none w-full"
                        autoFocus
                    />
                ) : (
                    <a href={(source.type === 'url' || source.type === 'youtube') ? source.content : undefined} target="_blank" rel="noopener noreferrer" className={`text-white truncate ${(source.type === 'url' || source.type === 'youtube') ? 'hover:underline' : ''}`}>
                      {contentDisplay}
                    </a>
                )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-sm text-gray-400">{source.status}</span>
                    <SourceStatusIcon status={source.status} />
                </div>
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(prev => !prev)} className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                        <MoreVerticalIcon className="w-4 h-4 text-gray-300" />
                    </button>
                    {menuOpen && (
                        <div className="absolute top-8 right-0 bg-[rgba(30,42,58,0.95)] backdrop-blur-xl border border-[rgba(255,255,255,0.12)] rounded-lg shadow-2xl w-40 z-50">
                            <button onClick={() => { setIsEditing(true); setMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-white hover:bg-[rgba(255,255,255,0.1)] rounded-t-lg">
                                <EditIcon className="w-4 h-4" /> Rename
                            </button>
                            <button onClick={() => onDelete(source.id)} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-red-400 hover:bg-[rgba(255,255,255,0.1)] rounded-b-lg">
                                <TrashIcon className="w-4 h-4 text-red-400" /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </li>
    )
}

export default Stage0DataCollection;