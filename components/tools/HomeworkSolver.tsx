import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { GraduationCap, Camera, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { solveHomework } from '../../services/gemini';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export const HomeworkSolver: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSolve = async () => {
    if (!question && !image) return;
    setLoading(true);
    try {
      let base64Image = undefined;
      if (image && imagePreview) {
        base64Image = imagePreview;
      }
      const result = await solveHomework(question || "Solve this problem shown in the image.", base64Image);
      setSolution(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Homework Solver"
      description="Get step-by-step explanations for math, science, and other homework problems."
      icon={<GraduationCap size={24} />}
    >
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4">
          <div className="relative">
             <textarea
              className="w-full p-4 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={4}
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <label className="cursor-pointer p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                <Camera size={20} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
          
          {imagePreview && (
            <div className="relative inline-block w-32 h-32 border rounded-lg overflow-hidden">
               <img src={imagePreview} alt="Homework" className="w-full h-full object-cover" />
               <button 
                onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-black/70"
               >
                 &times;
               </button>
            </div>
          )}

          <button
            onClick={handleSolve}
            disabled={(!question && !image) || loading}
            className="self-end bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <>Solve <Send size={16} /></>}
          </button>
        </div>
      </div>

      {solution && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Solution</h3>
          <div className="prose prose-indigo max-w-none">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {solution}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};