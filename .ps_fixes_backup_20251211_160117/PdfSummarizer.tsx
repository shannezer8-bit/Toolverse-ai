import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from '../ToolLayout';
import { FileText, Upload, Loader2, AlertCircle, FileCheck, FileOutput, FileInput, ArrowRight, Download, ImageIcon, Settings, FileSpreadsheet, X, Minimize2, Sliders } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { summarizePdf, convertPdfToFormat } from '../../services/gemini';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// --- PDF Worker Initialization ---
const initPdfWorker = () => {
  // Handle ESM default export wrapping
  // @ts-ignore
  const pdfJs = pdfjsLib.default || pdfjsLib;

  if (typeof window !== 'undefined' && pdfJs && pdfJs.GlobalWorkerOptions && !pdfJs.GlobalWorkerOptions.workerSrc) {
    try {
        pdfJs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
    } catch (e) {
        console.error("Worker init failed", e);
    }
  }
  return pdfJs;
};

type ToolMode = 'summarize' | 'pdf-to-word' | 'pdf-to-excel' | 'word-to-pdf' | 'excel-to-pdf' | 'image-to-pdf' | 'pdf-to-image' | 'compress-file' | 'compress-image';
type CompressionLevel = 'High' | 'Medium' | 'Low';

export const PdfSummarizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolMode>('summarize');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  
  const [summaryLength, setSummaryLength] = useState('detailed');
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('Medium');
  
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initPdfWorker();
  }, []);

  const resetState = () => {
    setFile(null);
    setResult(null);
    setError('');
    setLoading(false);
  };

  const handleTabChange = (tab: ToolMode) => {
    setActiveTab(tab);
    resetState();
  };

  const getAcceptedFileTypes = () => {
    switch (activeTab) {
      case 'summarize':
      case 'pdf-to-word':
      case 'pdf-to-excel':
      case 'pdf-to-image':
        return 'application/pdf';
      case 'word-to-pdf':
        return '.docx';
      case 'excel-to-pdf':
        return '.xlsx, .xls, .csv';
      case 'image-to-pdf':
      case 'compress-image':
        return 'image/*';
      case 'compress-file':
        return '.pdf, .docx, image/*';
      default:
        return '*/*';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  // --- COMPRESSION HELPERS ---
  
  const getCompressionSettings = () => {
    switch(compressionLevel) {
        case 'High': return { quality: 0.8, scale: 2.0 }; // High quality, larger size
        case 'Medium': return { quality: 0.6, scale: 1.5 }; // Balanced
        case 'Low': return { quality: 0.3, scale: 1.0 }; // Maximum compression
        default: return { quality: 0.6, scale: 1.5 };
    }
  };

  const compressImageBlob = async (blob: Blob, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Use white background for transparent images (optional, but good for JPEGs)
        if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        }

        canvas.toBlob(
          (newBlob) => {
            if (newBlob) resolve(newBlob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  };

  // --- ACTIONS ---

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await summarizePdf(reader.result as string, summaryLength);
          setResult({ type: 'text', content: res });
        } catch (e) { setError('Failed to summarize.'); }
        finally { setLoading(false); }
      };
      reader.readAsDataURL(file);
    } catch (e) { setError('Error reading file.'); setLoading(false); }
  };

  const handlePdfToFormat = async (format: 'word' | 'excel') => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await convertPdfToFormat(reader.result as string, format);
          const blobType = format === 'word' ? 'application/msword' : 'text/csv';
          const extension = format === 'word' ? 'doc' : 'csv';
          
          const blob = new Blob([res], { type: blobType });
          const url = URL.createObjectURL(blob);
          setResult({ type: 'download', url, filename: `converted.${extension}`, content: res });
        } catch (e) { setError(`Failed to convert PDF to ${format}.`); }
        finally { setLoading(false); }
      };
      reader.readAsDataURL(file);
    } catch (e) { setError('Error reading file.'); setLoading(false); }
  };

  const handleWordToPdf = async () => {
    if (!file) return;
    setLoading(true);
    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            try {
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setResult({ type: 'html-preview', content: result.value, filename: 'converted.pdf' });
            } catch (err) {
                setError("Failed to parse Word document.");
            }
            setLoading(false);
        };
        reader.readAsArrayBuffer(file);
    } catch (e) { setError('Error converting Word file.'); setLoading(false); }
  };

  const handleExcelToPdf = async () => {
      if (!file) return;
      setLoading(true);
      try {
          const reader = new FileReader();
          reader.onload = (e) => {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const html = XLSX.utils.sheet_to_html(worksheet);
              setResult({ type: 'html-preview', content: html, filename: 'spreadsheet.pdf' });
              setLoading(false);
          };
          reader.readAsArrayBuffer(file);
      } catch (e) { setError('Error converting Excel file.'); setLoading(false); }
  };

  const handleImageToPdf = async () => {
    if (!file) return;
    setLoading(true);
    try {
        const reader = new FileReader();
        reader.onload = () => {
            const imgData = reader.result as string;
            const pdf = new jsPDF();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            setResult({ type: 'download', url, filename: 'image-converted.pdf', isPdf: true });
            setLoading(false);
        };
        reader.readAsDataURL(file);
    } catch (e) { setError('Error processing image.'); setLoading(false); }
  };

  const handlePdfToImage = async () => {
      if(!file) return;
      setLoading(true);
      setError('');
      try {
          const fileData = await file.arrayBuffer();
          const pdfJs = initPdfWorker();
          if (!pdfJs) throw new Error("PDF Library not loaded");
          const pdf = await pdfJs.getDocument({ data: fileData }).promise;
          const page = await pdf.getPage(1); 
          const viewport = page.getViewport({ scale: 2.0 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          if(context) {
              await page.render({ canvasContext: context, viewport }).promise;
              const imgUrl = canvas.toDataURL('image/png');
              setResult({ type: 'image-display', url: imgUrl, filename: 'page-1.png' });
          }
          setLoading(false);
      } catch (e) { 
          setError('Error converting PDF. Please ensure the file is valid.'); 
          setLoading(false); 
      }
  };

  const handleCompressFile = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const { quality, scale } = getCompressionSettings();

    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      // 1. PDF Compression
      if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          const fileData = await file.arrayBuffer();
          const pdfJs = initPdfWorker();
          const pdf = await pdfJs.getDocument({ data: fileData }).promise;
          
          const newPdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
          newPdf.deletePage(1);

          for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              // Scale affects the resolution of the rasterized page
              const viewport = page.getViewport({ scale: scale }); 
              
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              
              if (context) {
                  await page.render({ canvasContext: context, viewport }).promise;
                  // Dynamic quality JPEG
                  const imgData = canvas.toDataURL('image/jpeg', quality); 
                  newPdf.addPage([viewport.width, viewport.height], viewport.width > viewport.height ? 'l' : 'p');
                  newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
              }
          }
          const blob = newPdf.output('blob');
          const url = URL.createObjectURL(blob);
          setResult({ type: 'download', url, filename: `compressed-${file.name}`, isPdf: true });
      } 
      // 2. DOCX Compression (Compresses internal images)
      else if (fileName.endsWith('.docx')) {
        const zip = new JSZip();
        const fileData = await file.arrayBuffer();
        const loadedZip = await zip.loadAsync(fileData);
        
        let compressedCount = 0;
        
        // Find media files
        const mediaFiles: string[] = [];
        loadedZip.forEach((relativePath) => {
          if (relativePath.startsWith('word/media/') && (relativePath.endsWith('.png') || relativePath.endsWith('.jpg') || relativePath.endsWith('.jpeg'))) {
            mediaFiles.push(relativePath);
          }
        });

        // Compress each media file
        for (const path of mediaFiles) {
          const content = await loadedZip.file(path)?.async('blob');
          if (content) {
            try {
              const compressedContent = await compressImageBlob(content, quality);
              loadedZip.file(path, compressedContent);
              compressedCount++;
            } catch (err) {
              console.warn(`Failed to compress ${path}`, err);
            }
          }
        }

        if (compressedCount === 0) {
           setError("No compressible images found in this Word document.");
           setLoading(false);
           return;
        }

        const newDocBlob = await loadedZip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(newDocBlob);
        setResult({ type: 'download', url, filename: `compressed-${file.name}` });
      }
      // 3. Image Compression
      else if (fileType.startsWith('image/')) {
        const compressedBlob = await compressImageBlob(file, quality);
        const url = URL.createObjectURL(compressedBlob);
        setResult({ type: 'download', url, filename: `compressed-${file.name.split('.')[0]}.jpg` });
      } 
      else {
        setError("Unsupported file type for compression. Please use PDF, DOCX, or Images.");
      }
    } catch (e) {
      console.error(e);
      setError('Error compressing file. It might be corrupted or password protected.');
    } finally {
      setLoading(false);
    }
  };

  const generatePdfFromHtml = async () => {
    if (!previewRef.current) return;
    setLoading(true);
    try {
        const canvas = await html2canvas(previewRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(result?.filename || 'document.pdf');
    } catch(e) {
        console.error(e);
        alert("Could not generate PDF download. Try printing the page.");
    } finally {
        setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch(activeTab) {
      case 'summarize': return 'Summarize PDF';
      case 'pdf-to-word': return 'Convert to Word';
      case 'pdf-to-excel': return 'Convert to Excel';
      case 'word-to-pdf': return 'Convert Word to PDF';
      case 'excel-to-pdf': return 'Convert Excel to PDF';
      case 'image-to-pdf': return 'Convert Image to PDF';
      case 'pdf-to-image': return 'Convert PDF to Image';
      case 'compress-file': return 'Compress File';
      case 'compress-image': return 'Compress Image';
      default: return 'Process';
    }
  };

  const renderTabButton = (id: ToolMode, label: string) => (
    <button 
        onClick={() => handleTabChange(id)} 
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === id 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'bg-white border text-gray-700 hover:bg-gray-50'
        }`}
    >
        {label}
    </button>
  );

  return (
    <ToolLayout
      title="PDF & Document Tools"
      description="A complete suite to summarize, convert, compress and manage your documents."
      icon={<FileText size={24} />}
    >
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
            {renderTabButton('summarize', 'Summarizer')}
            {renderTabButton('compress-file', 'Compress File')}
            {renderTabButton('compress-image', 'Compress Image')}
            {renderTabButton('pdf-to-word', 'PDF to Word')}
            {renderTabButton('pdf-to-excel', 'PDF to Excel')}
            {renderTabButton('word-to-pdf', 'Word to PDF')}
            {renderTabButton('excel-to-pdf', 'Excel to PDF')}
            {renderTabButton('image-to-pdf', 'Img to PDF')}
            {renderTabButton('pdf-to-image', 'PDF to Img')}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        1. Upload File
                        <span className="text-xs font-normal text-gray-500 ml-auto">
                            {activeTab.replace(/-/g, ' ').toUpperCase()}
                        </span>
                    </h3>

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                        <input
                            type="file"
                            accept={getAcceptedFileTypes()}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center pointer-events-none">
                            {file ? (
                                <>
                                    <FileCheck className="text-green-500 mb-3" size={40} />
                                    <p className="font-medium text-gray-900">{file.name}</p>
                                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </>
                            ) : (
                                <>
                                    <Upload className="text-gray-400 mb-3" size={40} />
                                    <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {activeTab === 'compress-file' 
                                            ? 'Supports PDF, DOCX, Images' 
                                            : activeTab === 'compress-image' 
                                                ? 'Supports JPG, PNG, WebP'
                                                : `Supports ${getAcceptedFileTypes()}`
                                        }
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {activeTab === 'summarize' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Summary Detail</label>
                            <div className="flex gap-2">
                                {['bullets', 'short', 'detailed'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setSummaryLength(t)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize border ${
                                            summaryLength === t ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-600'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'compress-file' || activeTab === 'compress-image') && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <Sliders size={16} /> Compression Quality
                            </label>
                            <div className="flex gap-2">
                                {['Low', 'Medium', 'High'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setCompressionLevel(level as CompressionLevel)}
                                        className={`flex-1 py-2 rounded-md text-xs font-medium border transition-colors ${
                                            compressionLevel === level 
                                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {compressionLevel === 'Low' ? 'Maximum reduction. Quality may be visibly lower.' : 
                                 compressionLevel === 'Medium' ? 'Balanced compression. Good for most documents.' : 
                                 'Best quality. Minimal artifacts but larger file size.'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            switch(activeTab) {
                                case 'summarize': handleSummarize(); break;
                                case 'pdf-to-word': handlePdfToFormat('word'); break;
                                case 'pdf-to-excel': handlePdfToFormat('excel'); break;
                                case 'word-to-pdf': handleWordToPdf(); break;
                                case 'excel-to-pdf': handleExcelToPdf(); break;
                                case 'image-to-pdf': handleImageToPdf(); break;
                                case 'pdf-to-image': handlePdfToImage(); break;
                                case 'compress-file': handleCompressFile(); break;
                                case 'compress-image': handleCompressFile(); break; // Reuse logic
                            }
                        }}
                        disabled={!file || loading}
                        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 font-medium shadow-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : getButtonText()}
                    </button>
                </div>
            </div>

            {/* Results Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Output</h3>
                
                <div className="flex-1 flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
                            <p>Processing your document...</p>
                        </div>
                    ) : result ? (
                        <div className="animate-fade-in flex flex-col h-full">
                            {/* Text Output (Summarizer) */}
                            {result.type === 'text' && (
                                <div className="prose prose-sm prose-blue max-w-none flex-1 overflow-y-auto">
                                    <ReactMarkdown>{result.content}</ReactMarkdown>
                                </div>
                            )}

                            {/* Download Output (Conversions) */}
                            {result.type === 'download' && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                                    <FileCheck size={64} className="text-green-500 mb-4" />
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                                        {activeTab.includes('compress') ? 'Compression Complete!' : 'Conversion Complete!'}
                                    </h4>
                                    <p className="text-gray-600 mb-6">Your file is ready to download.</p>
                                    <a 
                                        href={result.url} 
                                        download={result.filename}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md transition-transform hover:-translate-y-0.5"
                                    >
                                        <Download size={20} /> Download File
                                    </a>
                                </div>
                            )}

                             {/* Image Display */}
                             {result.type === 'image-display' && (
                                <div className="flex-1 flex flex-col items-center">
                                    <div className="border rounded-lg p-2 bg-gray-50 mb-4 max-h-[400px] overflow-auto">
                                        <img src={result.url} alt="Converted" className="max-w-full h-auto" />
                                    </div>
                                    <a 
                                        href={result.url} 
                                        download={result.filename}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <Download size={16} /> Download Image
                                    </a>
                                </div>
                            )}

                            {/* HTML Preview (Word/Excel to PDF) */}
                            {result.type === 'html-preview' && (
                                <div className="flex flex-col h-full">
                                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm mb-4 flex gap-2">
                                        <AlertCircle size={16} className="mt-0.5" />
                                        <p>Review the layout below. Click "Download PDF" to save it.</p>
                                    </div>
                                    
                                    <div className="flex-1 border rounded-lg overflow-y-auto p-8 bg-white shadow-inner mb-4 max-h-[500px]">
                                        <div 
                                            ref={previewRef} 
                                            dangerouslySetInnerHTML={{ __html: result.content }} 
                                            className="prose max-w-none"
                                        />
                                    </div>

                                    <button 
                                        onClick={generatePdfFromHtml}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex justify-center items-center gap-2"
                                    >
                                        <Download size={18} /> Download PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                            <Minimize2 size={64} className="mb-4 opacity-50" />
                            <p>Result will appear here...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </ToolLayout>
  );
};