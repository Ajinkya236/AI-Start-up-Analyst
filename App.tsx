
import React, { useState, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import ReportsPage from './components/ReportsPage';
import ReportDetailPage from './components/ReportDetailPage';
import FounderRegistrationPage from './components/FounderRegistrationPage';
import GlobalHeader from './components/GlobalHeader';

// Define types that are used across components
export type AgentStatus = 'idle' | 'pending' | 'completed';

export interface DataSource {
  id: string;
  type: 'url' | 'file' | 'text' | 'youtube' | 'image' | 'transcript' | 'assessment' | 'research';
  content: string;
  filename?: string;
  summary?: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  isSelected: boolean;
}

const defaultMemoSections = [
    { name: 'Executive Summary', weight: 25, enabled: true },
    { name: 'Objective of the Memo', weight: 15, enabled: true },
    { name: 'Problem Statement', weight: 20, enabled: true },
    { name: 'Solution Description', weight: 20, enabled: true },
    { name: 'Business Overview (Model, Plan, Product-Market Fit)', weight: 18, enabled: true },
    { name: 'Market Analysis (TAM, SAM, SOM, Trends)', weight: 22, enabled: true },
    { name: 'Competitive Landscape (Competitors, SWOT, Differentiation)', weight: 20, enabled: true },
    { name: 'Product Development Status (Roadmap, Milestones)', weight: 15, enabled: true },
    { name: 'Sales & Distribution (GTM Strategy, CAC, LTV)', weight: 15, enabled: true },
    { name: 'Key Metrics & Financials (Growth, Projections, Burn Rate)', weight: 18, enabled: true },
    { name: 'Management Team (Founders, Executives, Advisors)', weight: 22, enabled: true },
    { name: 'Investment Thesis', weight: 25, enabled: true },
    { name: 'Strategic Fit', weight: 12, enabled: true },
    { name: 'Risks and Mitigation', weight: 16, enabled: true },
    { name: 'Valuation and Deal Structure', weight: 10, enabled: true },
    { name: 'Exit Strategies', weight: 10, enabled: true },
    { name: 'Screening Report (Red Flags, Green Flags, AI Confidence)', weight: 25, enabled: true },
    { name: 'Investment Score', weight: 0, enabled: false }, // Typically a summary field, not for generation
];


export interface Report {
  id: string;
  title: string;
  companyName: string;
  founder: {
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  currentStage: number; // 0: Data Collection, 1: Investment Memo, 2: Curated Memo
  dataSources: DataSource[];
  founderVoice: { status: AgentStatus; lastTriggered?: string };
  founderBehaviourTest: { status: AgentStatus; lastTriggered?: string };
  investmentMemo: {
    status: AgentStatus;
    content: string;
    preferences: {
      sections: { name: string; weight: number; enabled: boolean }[];
    };
  };
  curatedMemo: {
    status: AgentStatus;
    content: string;
    preferences: {
      tone: 'Formal' | 'Balanced' | 'Bullish';
      length: 'Concise' | 'Standard' | 'Detailed';
      customInstructions: string;
      sections: { name: string; weight: number; enabled: boolean }[];
      // FIX: Add audience and format to support EditCuratedPreferencesModal.tsx and fix type errors.
      audience: 'Internal' | 'LP' | 'External';
      format: 'Markdown' | 'PDF' | 'DOCX';
    };
  };
}

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'reports' | 'detail' | 'register'>('landing');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const handleNavigateHome = useCallback(() => setView('landing'), []);

  const handleUpdateReport = useCallback((id: string, data: Partial<Report>, callback?: () => void) => {
    setReports(prevReports =>
      prevReports.map(r => (r.id === id ? { ...r, ...data } : r))
    );
    if (callback) {
        // This is a simplification; for complex cases, useEffects in components are better
        setTimeout(callback, 0);
    }
  }, []);

  const handleAddReport = (reportData: {companyName: string, description?: string, founderPhone: string, founderEmail: string}) => {
    
    const dataSources: DataSource[] = [];
    if(reportData.description) {
        dataSources.push({
            id: `ds-desc-${Date.now()}`,
            type: 'text',
            content: reportData.description,
            filename: 'Company Description',
            status: 'Completed',
            isSelected: true
        });
    }

    const newReport: Report = {
        id: `rep-${Date.now()}`,
        title: `${reportData.companyName} - Initial Analysis`,
        companyName: reportData.companyName,
        founder: {
            name: 'Founder Name', // Placeholder
            email: reportData.founderEmail,
            phone: reportData.founderPhone,
        },
        date: new Date().toISOString(),
        currentStage: 0,
        dataSources: dataSources,
        founderVoice: { status: 'idle' },
        founderBehaviourTest: { status: 'idle' },
        investmentMemo: {
          status: 'idle',
          content: '',
          preferences: {
            sections: JSON.parse(JSON.stringify(defaultMemoSections)),
          },
        },
        curatedMemo: {
          status: 'idle',
          content: '',
          preferences: {
            tone: 'Balanced',
            length: 'Standard',
            customInstructions: '',
            sections: JSON.parse(JSON.stringify(defaultMemoSections)),
            // FIX: Add default values for new properties.
            audience: 'Internal',
            format: 'Markdown',
          },
        },
      };

    setReports(prev => [...prev, newReport]);
    setSelectedReportId(newReport.id);
    setView('detail');
  }

  const handleCreateReportFromRegistered = (sourceReportId: string) => {
    const sourceReport = reports.find(r => r.id === sourceReportId);
    if (!sourceReport) return;

    const newReport: Report = {
      ...JSON.parse(JSON.stringify(sourceReport)), // Deep copy
      id: `rep-analyst-${Date.now()}`,
      title: `${sourceReport.companyName} - Analyst Report`,
      date: new Date().toISOString(),
      currentStage: 0,
       investmentMemo: { // Reset memo state for new analysis
          status: 'idle',
          content: '',
          preferences: {
            sections: JSON.parse(JSON.stringify(defaultMemoSections)),
          },
        },
        curatedMemo: {
          status: 'idle',
          content: '',
          preferences: {
            tone: 'Balanced',
            length: 'Standard',
            customInstructions: '',
            sections: JSON.parse(JSON.stringify(defaultMemoSections)),
            // FIX: Add default values for new properties.
            audience: 'Internal',
            format: 'Markdown',
          },
        },
    };
    
    setReports(prev => [...prev, newReport]);
    setSelectedReportId(newReport.id);
    setView('detail');
  }


  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  }

  const handleSelectReport = (id: string) => {
    setSelectedReportId(id);
    setView('detail');
  }
  
  const handleFounderSubmit = (data: {
    companyName: string,
    description: string,
    founderPhone: string,
    founderEmail: string,
    files: DataSource[],
    transcript: DataSource | null,
    assessment: DataSource
  }) => {
      const allSources = [...data.files];
      if (data.transcript) allSources.push(data.transcript);
      if (data.assessment) allSources.push(data.assessment);
      if (data.description) {
        allSources.unshift({
            id: `ds-desc-${Date.now()}`,
            type: 'text',
            content: data.description,
            filename: 'Company Description',
            status: 'Completed',
            isSelected: true,
        });
      }
      
      const newReport: Report = {
        id: `rep-founder-${Date.now()}`,
        title: `${data.companyName} - Founder Submission`,
        companyName: data.companyName,
        founder: {
          name: 'Founder', // This can be improved
          email: data.founderEmail,
          phone: data.founderPhone,
        },
        date: new Date().toISOString(),
        currentStage: 0,
        dataSources: allSources,
        founderVoice: { status: data.transcript ? 'completed' : 'idle' },
        founderBehaviourTest: { status: 'completed' },
        investmentMemo: {
          status: 'idle',
          content: '',
          preferences: {
            sections: JSON.parse(JSON.stringify(defaultMemoSections)),
          },
        },
        curatedMemo: {
          status: 'idle',
          content: '',
          preferences: {
            tone: 'Balanced',
            length: 'Standard',
            customInstructions: '',
            sections: JSON.parse(JSON.stringify(defaultMemoSections)),
            // FIX: Add default values for new properties.
            audience: 'Internal',
            format: 'Markdown',
          },
        },
      };
      setReports(prev => [...prev, newReport]);
      // After submission, maybe show a success message and go back to landing
      setView('landing');
      alert('Thank you for your submission. An analyst will be in touch.');
  };

  const selectedReport = reports.find(r => r.id === selectedReportId);

  const renderView = () => {
    switch (view) {
      case 'reports':
        return (
          <ReportsPage 
            reports={reports} 
            onSelectReport={handleSelectReport} 
            onAddReport={handleAddReport}
            onDeleteReport={handleDeleteReport}
            onCreateFromRegistered={handleCreateReportFromRegistered}
          />
        );
      case 'detail':
        if (selectedReport) {
          return (
            <ReportDetailPage
              report={selectedReport}
              onUpdateReport={handleUpdateReport}
              onBack={() => {setSelectedReportId(null); setView('reports')}}
            />
          );
        }
        // Fallback if no report is selected
        setView('reports');
        return null;
      case 'register':
          return <FounderRegistrationPage onSubmit={handleFounderSubmit} onBack={handleNavigateHome} />
      case 'landing':
      default:
        return <LandingPage onAnalyze={() => setView('reports')} onRegister={() => setView('register')} />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#020617] to-[#111827] text-white min-h-screen font-sans">
      {view !== 'landing' && <GlobalHeader onNavigateHome={handleNavigateHome} />}
      {renderView()}
    </div>
  );
};

export default App;
