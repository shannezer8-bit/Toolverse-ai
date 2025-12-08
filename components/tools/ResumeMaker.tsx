import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { User, Loader2, Download, Briefcase, FileText, Mail } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateResume, generateCoverLetter } from '../../services/gemini';

type Mode = 'resume' | 'cover-letter';

export const ResumeMaker: React.FC = () => {
  const [mode, setMode] = useState<Mode>('resume');
  const [inputData, setInputData] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const handleGenerate = async () => {
    if (!inputData.trim()) return;
    setLoading(true);
    try {
      let result = '';
      if (mode === 'resume') {
        result = await generateResume(inputData, jobDescription);
      } else {
        result = await generateCoverLetter(inputData, jobDescription);
      }
      setOutput(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Resume & Cover Letter AI"
      description="Create a professional resume or a persuasive cover letter tailored to your dream job."
      icon={<User size={24} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
              <button
                onClick={() => setMode('resume')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'resume' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={16} /> Resume
              </button>
              <button
                onClick={() => setMode('cover-letter')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === 'cover-letter' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail size={16} /> Cover Letter
              </button>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2">1. Your Experience & Skills</h3>
            <textarea
              className="w-full h-48 p-4 mb-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
              placeholder={`Name: John Doe
Experience: 
- Senior Dev at Google (2020-Present)
- Jr Dev at Amazon (2018-2020)
Education: MIT CS
Skills: React, Node, Cloud`}
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
            
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              2. Target Job Description 
              <span className="text-xs font-normal text-gray-500">
                {mode === 'resume' ? '(Optional)' : '(Recommended)'}
              </span>
            </h3>
            <textarea
              className="w-full h-32 p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm"
              placeholder="Paste the job description here to tailor your document..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <button
              onClick={handleGenerate}
              disabled={!inputData.trim() || loading}
              className="mt-4 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 font-medium"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (mode === 'resume' ? 'Generate Resume' : 'Generate Cover Letter')}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h3 className="font-semibold text-gray-900 capitalize">{mode.replace('-', ' ')} Preview</h3>
             {output && (
               <button 
                onClick={() => window.print()} 
                className="text-xs flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
               >
                 <Download size={14} /> Print / Save PDF
               </button>
             )}
          </div>
          
          <div className="flex-1 overflow-y-auto rounded-lg bg-white prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-purple-600">
             {output ? (
               <ReactMarkdown>{output}</ReactMarkdown>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                 <Briefcase size={32} className="opacity-20" />
                 <p className="italic">Generated {mode.replace('-', ' ')} will appear here...</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};