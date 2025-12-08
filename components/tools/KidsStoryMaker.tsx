import React, { useState, useRef } from 'react';
import { ToolLayout } from '../ToolLayout';
import { BookOpen, Sparkles, Loader2, Volume2, StopCircle, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateStory, generateSpeech } from '../../services/gemini';

// --- Audio Decoding Helpers ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): AudioBuffer {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const KidsStoryMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [character, setCharacter] = useState('');
  const [age, setAge] = useState('5');
  const [genre, setGenre] = useState('Adventure');
  const [moral, setMoral] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState('');
  
  // Audio state
  const [voice, setVoice] = useState('Kore'); // 'Kore' is typically female-sounding
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleGenerate = async () => {
    if (!topic || !character) return;
    setLoading(true);
    // Stop any playing audio if new story is generated
    stopAudio();
    try {
      const result = await generateStory(topic, character, age, genre, moral, language);
      setStory(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReadStory = async () => {
    if (!story) return;
    setAudioLoading(true);
    
    try {
      const audioBase64 = await generateSpeech(story, voice);
      await playAudio(audioBase64);
    } catch (e) {
      console.error("Audio Playback Error", e);
      alert("Could not generate or play audio.");
    } finally {
      setAudioLoading(false);
    }
  };

  const playAudio = async (base64: string) => {
    // Ensure Context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Stop previous
    stopAudio();

    // Decode
    const bytes = decode(base64);
    const buffer = decodeAudioData(bytes, ctx, 24000, 1);

    // Play
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);
    
    sourceRef.current = source;
    source.start();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) { /* ignore if already stopped */ }
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <ToolLayout
      title="Kids Story Maker"
      description="Create magical, personalized stories for children in seconds."
      icon={<BookOpen size={24} />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic / Theme</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. Space, Dinosaurs"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Character</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. Timmy the Turtle"
                  value={character}
                  onChange={(e) => setCharacter(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select 
                      value={genre} 
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  >
                      <option value="Adventure">Adventure</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Bedtime Story">Bedtime Story</option>
                      <option value="Funny">Funny</option>
                      <option value="Mystery">Mystery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                  <select 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Italian">Italian</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Russian">Russian</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson/Moral (Optional)</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. Sharing is caring"
                  value={moral}
                  onChange={(e) => setMoral(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child's Age: {age}</label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  className="w-full accent-green-500"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              
              {/* Voice Selection */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Narrator Voice</label>
                 <div className="flex gap-2">
                    <button 
                        onClick={() => setVoice('Kore')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm border transition-colors ${voice === 'Kore' ? 'bg-pink-100 border-pink-400 text-pink-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        👩 Sweet Female
                    </button>
                    <button 
                        onClick={() => setVoice('Puck')}
                        className={`flex-1 py-2 px-3 rounded-md text-sm border transition-colors ${voice === 'Puck' ? 'bg-blue-100 border-blue-400 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        👨 Sweet Male
                    </button>
                 </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!topic || !character || loading}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><Sparkles size={18} /> Create Story</>}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
            {story ? (
              <>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                      <Globe size={20} className="text-blue-500" /> Story Time ({language})
                    </h3>
                    {!isPlaying ? (
                        <button 
                            onClick={handleReadStory}
                            disabled={audioLoading}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-transform hover:-translate-y-0.5 shadow-md text-sm font-medium"
                        >
                            {audioLoading ? <Loader2 className="animate-spin" size={16} /> : <Volume2 size={18} />}
                            Read Aloud
                        </button>
                    ) : (
                        <button 
                            onClick={stopAudio}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-transform hover:-translate-y-0.5 shadow-md text-sm font-medium animate-pulse"
                        >
                            <StopCircle size={18} />
                            Stop Reading
                        </button>
                    )}
                </div>
                <div className="prose prose-green max-w-none flex-1">
                    <ReactMarkdown>{story}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <BookOpen size={64} className="mb-4 opacity-50" />
                <p>Your story will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};