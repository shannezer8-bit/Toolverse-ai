export enum ToolId {
  PdfSummarizer = 'pdf-summarizer',
  ResumeMaker = 'resume-maker',
  CaptionGenerator = 'caption-generator',
  KidsStoryMaker = 'kids-story-maker',
  HomeworkSolver = 'homework-solver',
  BudgetPlanner = 'budget-planner',
  ImageGenerator = 'image-generator'
}

export interface ToolConfig {
  id: ToolId;
  name: string;
  icon: React.ReactNode;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  isError?: boolean;
}