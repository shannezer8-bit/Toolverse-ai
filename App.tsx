import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ToolId } from './types';
import { PdfSummarizer } from './components/tools/PdfSummarizer';
import { ResumeMaker } from './components/tools/ResumeMaker';
import { CaptionGenerator } from './components/tools/CaptionGenerator';
import { KidsStoryMaker } from './components/tools/KidsStoryMaker';
import { HomeworkSolver } from './components/tools/HomeworkSolver';
import { BudgetPlanner } from './components/tools/BudgetPlanner';
import { ImageGenerator } from './components/tools/ImageGenerator';

function App() {
  const [activeTool, setActiveTool] = useState<ToolId>(ToolId.PdfSummarizer);

  const renderTool = () => {
    switch (activeTool) {
      case ToolId.PdfSummarizer: return <PdfSummarizer />;
      case ToolId.ResumeMaker: return <ResumeMaker />;
      case ToolId.CaptionGenerator: return <CaptionGenerator />;
      case ToolId.KidsStoryMaker: return <KidsStoryMaker />;
      case ToolId.HomeworkSolver: return <HomeworkSolver />;
      case ToolId.BudgetPlanner: return <BudgetPlanner />;
      case ToolId.ImageGenerator: return <ImageGenerator />;
      default: return <PdfSummarizer />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar activeTool={activeTool} onSelectTool={setActiveTool} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 shadow-md flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              🚀 ToolVerse AI Dashboard
            </h1>
            <p className="text-purple-100 text-lg">
              Your personalized AI Tools Control Center
            </p>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderTool()}
        </main>
      </div>
    </div>
  );
}

export default App;