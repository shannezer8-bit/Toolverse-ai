import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { Image as ImageIcon, Sparkles, Loader2, Download } from 'lucide-react';
import { generateImage } from '../../services/gemini';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);
    try {
      const url = await generateImage(prompt, aspectRatio);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Image Generator"
      description="Turn your text descriptions into unique, AI-generated images."
      icon={<ImageIcon size={24} />}
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                <input
                    type="text"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
                    placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
            </div>
            
            <div className="flex items-end gap-4">
                <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aspect Ratio</label>
                    <select 
                        value={aspectRatio} 
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 outline-none"
                    >
                        <option value="1:1">Square (1:1)</option>
                        <option value="16:9">Landscape (16:9)</option>
                        <option value="9:16">Portrait (9:16)</option>
                        <option value="4:3">Standard (4:3)</option>
                        <option value="3:4">Tall (3:4)</option>
                    </select>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || loading}
                    className="flex-1 bg-pink-600 text-white h-[46px] rounded-lg hover:bg-pink-700 font-medium flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                    Generate Image
                </button>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
          {loading ? (
             <div className="flex flex-col items-center gap-4 text-gray-500">
               <Loader2 className="animate-spin w-12 h-12 text-pink-500" />
               <p>Dreaming up your image...</p>
             </div>
          ) : imageUrl ? (
            <div className="relative group w-full flex justify-center">
              <img src={imageUrl} alt="Generated" className="max-h-[600px] rounded-lg shadow-md object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <a 
                  href={imageUrl} 
                  download={`generated-image-${Date.now()}.png`}
                  className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-gray-100"
                >
                  <Download size={18} /> Download
                </a>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <ImageIcon size={64} className="mb-4 opacity-30" />
              <p>Enter a prompt to generate an image</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};