import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ReportsPage from './components/ReportsPage';
import ReportDetailPage from './components/ReportDetailPage';
import './index.css';

// FIX: Added full implementation of App.tsx, which was missing.
// This component now defines the core data structures for the application (Report, DataSource, etc.)
// and manages the overall application state, including routing between pages and handling report data.

export type DataSource = {
  id: string;
  type: 'url' | 'file' | 'text' | 'transcript' | 'assessment' | 'research';
  content: string;
  filename?: string;
  summary?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  isSelected: boolean;
};

export type AgentStatus = 'idle' | 'pending' | 'completed';

export interface Report {
  id: string;
  title: string;
  companyName: string;
  description: string;
  lastEdited: string;
  currentStage: number; // 0: Data, 1: AI Memo, 2: Curated Memo
  founder: {
    phone: string;
    email: string;
  };
  dataSources: DataSource[];
  founderVoice: {
    status: AgentStatus;
    lastTriggered?: string;
  };
  founderBehaviourTest: {
    status: AgentStatus;
    lastTriggered?: string;
  };
  investmentMemo: {
    status: AgentStatus;
    content: string;
    preferences: {
      tone: 'Formal' | 'Balanced' | 'Bullish';
      length: 'Concise' | 'Standard' | 'Detailed';
      sections: { name: string; weight: number; enabled: boolean }[];
    };
  };
  curatedMemo: {
    status: AgentStatus;
    content: string;
    preferences: {
      audience: 'Internal' | 'LP' | 'External';
      format: 'Markdown' | 'PDF' | 'DOCX';
    };
  };
}


const defaultMemoPreferences: Report['investmentMemo']['preferences'] = {
    tone: 'Balanced',
    length: 'Standard',
    sections: [
        { name: "Executive Summary", weight: 25, enabled: true },
        { name: "Problem & Solution", weight: 20, enabled: true },
        { name: "Product Deep Dive", weight: 15, enabled: true },
        { name: "Market Size (TAM, SAM, SOM)", weight: 20, enabled: true },
        { name: "Competitive Landscape", weight: 18, enabled: true },
        { name: "Go-to-Market Strategy", weight: 15, enabled: false },
        { name: "Team & Founder Analysis", weight: 22, enabled: true },
        { name: "Traction & Financials", weight: 18, enabled: true },
        { name: "Deal Terms", weight: 10, enabled: false },
        { name: "Risks & Mitigation", weight: 16, enabled: true },
        { name: "Investment Thesis", weight: 25, enabled: true },
    ]
};

const defaultCuratedMemoPreferences: Report['curatedMemo']['preferences'] = {
    audience: 'Internal',
    format: 'Markdown',
};

const initialReports: Report[] = [
  {
    id: 'rep-1',
    title: 'Innovate Capital Analysis',
    companyName: 'Innovate Capital',
    description: 'AI-driven solutions for renewable energy sector.',
    lastEdited: new Date(Date.now() - 86400000).toISOString(),
    currentStage: 0,
    founder: { phone: '+14155552671', email: 'founder@innovate.com' },
    dataSources: [],
    founderVoice: { status: 'idle' },
    founderBehaviourTest: { status: 'idle' },
    investmentMemo: { status: 'idle', content: '', preferences: defaultMemoPreferences },
    curatedMemo: { status: 'idle', content: '', preferences: defaultCuratedMemoPreferences }
  },
   {
    id: 'rep-2',
    title: 'NextGen Ventures Analysis',
    companyName: 'NextGen Ventures',
    description: 'Pioneering advancements in biotech.',
    lastEdited: new Date(Date.now() - 172800000).toISOString(),
    currentStage: 0,
    founder: { phone: '+14155552678', email: 'contact@nextgen.vc' },
    dataSources: [],
    founderVoice: { status: 'idle' },
    founderBehaviourTest: { status: 'idle' },
    investmentMemo: { status: 'idle', content: '', preferences: defaultMemoPreferences },
    curatedMemo: { status: 'idle', content: '', preferences: defaultCuratedMemoPreferences }
  },
];


function App() {
  const [view, setView] = useState<'landing' | 'reports' | 'detail'>('landing');
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleCreateReport = (data: Omit<Report, 'id' | 'lastEdited' | 'currentStage' | 'dataSources' | 'founderVoice' | 'founderBehaviourTest' | 'investmentMemo' | 'curatedMemo'>) => {
    const newReport: Report = {
      ...data,
      id: `rep-${Date.now()}`,
      lastEdited: new Date().toISOString(),
      currentStage: 0,
      dataSources: [],
      founderVoice: { status: 'idle' },
      founderBehaviourTest: { status: 'idle' },
      investmentMemo: { status: 'idle', content: '', preferences: defaultMemoPreferences },
      curatedMemo: { status: 'idle', content: '', preferences: defaultCuratedMemoPreferences }
    };
    setReports(prev => [newReport, ...prev]);
    setSelectedReportId(newReport.id);
    setView('detail');
  };

  const handleUpdateReport = (id: string, data: Partial<Report>) => {
    setReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, ...data, lastEdited: new Date().toISOString() } : report
      )
    );
  };
  
  const handleUpdateReportTitle = (id: string, data: Partial<Pick<Report, 'title'>>) => {
      handleUpdateReport(id, data);
  };

  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  };
  
  const handleSelectReport = (id: string) => {
      setSelectedReportId(id);
      setView('detail');
  }
  
  const handleGoHome = () => {
      setSelectedReportId(null);
      setView('landing');
  }
  
  const handleBackToReports = () => {
      setSelectedReportId(null);
      setView('reports');
  }

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const renderContent = () => {
      if (view === 'detail' && selectedReport) {
        return <ReportDetailPage report={selectedReport} onUpdateReport={handleUpdateReport} onBack={handleBackToReports} />;
      }
      if (view === 'reports') {
        return <ReportsPage 
                    reports={reports} 
                    onSelectReport={handleSelectReport}
                    onCreateReport={handleCreateReport}
                    onDeleteReport={handleDeleteReport}
                    onUpdateReport={handleUpdateReportTitle}
                    onGoHome={handleGoHome}
                />;
      }
      return <LandingPage onAnalyze={() => setView('reports')} />;
  }

  return (
    <div className="bg-[#0F1419] text-white min-h-screen font-sans">
        {renderContent()}
    </div>
  );
}

export default App;
