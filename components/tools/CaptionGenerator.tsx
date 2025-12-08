import React, { useState } from 'react';
import { ToolLayout } from '../ToolLayout';
import { MessageSquare, Image as ImageIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateCaptions } from '../../services/gemini';

export const CaptionGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState('');
  
  const [platform, setPlatform] = useState('Instagram');
  const [tone, setTone] = useState('engaging');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!text && !image) return;
    setLoading(true);
    try {
      let base64Image = undefined;
      if (image && imagePreview) {
        base64Image = imagePreview;
      }
      const result = await generateCaptions(text || "Describe this image", base64Image, platform, tone);
      setCaptions(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Caption Generator"
      description="Upload an image or describe your post to get viral-worthy captions with hashtags."
      icon={<MessageSquare size={24} />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>
              {imagePreview && (
                 <button onClick={() => {setImage(null); setImagePreview(null);}} className="text-xs text-red-500 mt-1 hover:underline">Remove Image</button>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description / Context</label>
              <textarea
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                rows={3}
                placeholder="e.g., A photo of me hiking in the Alps during sunset..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="Instagram">Instagram</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Twitter">Twitter / X</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="TikTok">TikTok</option>
                        <option value="Facebook">Facebook</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                    <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="engaging">Engaging</option>
                        <option value="funny">Funny</option>
                        <option value="professional">Professional</option>
                        <option value="inspirational">Inspirational</option>
                        <option value="sarcastic">Sarcastic</option>
                    </select>
                </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={(!text && !image) || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2 shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Generate Captions'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
            {captions ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in h-full">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Suggested Captions</h3>
                <div className="prose prose-purple max-w-none">
                <ReactMarkdown>{captions}</ReactMarkdown>
                </div>
            </div>
            ) : (
             <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <MessageSquare size={40} className="mx-auto mb-2 opacity-20" />
                    <p>Captions will appear here</p>
                </div>
             </div>
            )}
        </div>
      </div>
    </ToolLayout>
  );
};