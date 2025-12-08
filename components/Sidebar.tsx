import React from 'react';
import { 
  FileText, 
  User, 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  DollarSign, 
  Image as ImageIcon 
} from 'lucide-react';
import { ToolId, ToolConfig } from '../types';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool: (id: ToolId) => void;
}

export const TOOLS: ToolConfig[] = [
  { id: ToolId.PdfSummarizer, name: 'PDF & Doc Tools', icon: <FileText size={20} />, description: 'Summarize, convert, and manage your documents.' },
  { id: ToolId.ResumeMaker, name: 'Resume Maker AI', icon: <User size={20} />, description: 'Turn your details into a professional resume instantly.' },
  { id: ToolId.CaptionGenerator, name: 'Caption Generator', icon: <MessageSquare size={20} />, description: 'Generate viral captions for your social media posts.' },
  { id: ToolId.KidsStoryMaker, name: 'Kids Story Maker', icon: <BookOpen size={20} />, description: 'Create magical personalized stories for children.' },
  { id: ToolId.HomeworkSolver, name: 'Homework Solver', icon: <GraduationCap size={20} />, description: 'Get step-by-step solutions for complex problems.' },
  { id: ToolId.BudgetPlanner, name: 'Budget Planner', icon: <DollarSign size={20} />, description: 'Plan your monthly finances with smart AI insights.' },
  { id: ToolId.ImageGenerator, name: 'Image Generator', icon: <ImageIcon size={20} />, description: 'Generate unique images from text prompts.' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  return (
    <div className="w-64 bg-black text-gray-300 flex flex-col h-full border-r border-gray-800 flex-shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">ToolVerse AI</h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-colors ${
              activeTool === tool.id
                ? 'bg-gray-800 text-white'
                : 'hover:bg-gray-900 hover:text-white'
            }`}
          >
            {tool.icon}
            {tool.name}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        &copy; 2025 ToolVerse AI
      </div>
    </div>
  );
};