import React, { useState } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
  Sparkles,
  AlertCircle,
  Trash2,
  ChevronRight
} from 'lucide-react';
import type { ImageItem, DocumentItem } from '../../types';
import { PhotoDropzone } from './PhotoDropzone';
import { PhotoCard } from './PhotoCard';
import { generateDocument } from '../../services/api';

interface CreateDocumentProps {
  onDocumentCreated: (doc: DocumentItem) => void;
  onCancel: () => void;
}

export const CreateDocument: React.FC<CreateDocumentProps> = ({
  onDocumentCreated,
  onCancel,
}) => {
  // Form State
  const [title, setTitle] = useState('');
  const [introText, setIntroText] = useState('');
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [imageAlignment, setImageAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [imageSize, setImageSize] = useState<'standard' | 'large' | 'compact' | 'full'>('standard');
  const [oneImagePerPage, setOneImagePerPage] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);

  // Generation & Status State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sanitize title for filename display
  const sanitizeName = (raw: string) => {
    if (!raw.trim()) return 'Snap2Doc_Document';
    const clean = raw.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_').replace(/^_+|_+$/g, '');
    return clean || 'Snap2Doc_Document';
  };
  const previewFilename = `${sanitizeName(title)}.docx`;

  const handleFilesAdded = (files: File[]) => {
    const newItems: ImageItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
      name: file.name,
      size: file.size,
    }));
    setImages((prev) => [...prev, ...newItems]);
    setErrorMessage(null);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption } : img))
    );
  };

  const handleRemove = (id: string) => {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleClearAll = () => {
    images.forEach((img) => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMessage('Please upload at least one photo before generating the Word document.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      setGenerationStep('Validating photo formats & sizes...');
      await new Promise((r) => setTimeout(r, 400));

      setGenerationStep('Auto-correcting EXIF photo orientations...');
      await new Promise((r) => setTimeout(r, 400));

      setGenerationStep('Formatting Microsoft Word document structure...');

      // Prepare FormData
      const formData = new FormData();
      images.forEach((item) => {
        formData.append('images', item.file, item.name);
      });

      formData.append('title', title.trim() || 'Photo Collection Document');
      formData.append('intro_text', introText.trim());
      formData.append('page_orientation', pageOrientation);
      formData.append('image_alignment', imageAlignment);
      formData.append('image_size', imageSize);
      formData.append('one_image_per_page', oneImagePerPage.toString());

      // Captions JSON array
      const captionsData = images.map((item) => ({
        original_filename: item.name,
        caption: item.caption.trim(),
      }));
      formData.append('captions', JSON.stringify(captionsData));

      setGenerationStep('Compiling and saving .docx file...');
      const createdDoc = await generateDocument(formData);

      setGenerationStep('Document generated successfully!');
      await new Promise((r) => setTimeout(r, 300));

      onDocumentCreated(createdDoc);
    } catch (err: any) {
      console.error('Error generating document:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while generating the document.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span>Document Creator</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Step-by-step Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Word Document from Photos
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Upload images, add descriptions and captions, configure orientation and sizing, then generate a standard Microsoft Word document.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold">Creation Error</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Document Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
              <span>Document Details</span>
            </h2>
            <span className="text-xs text-slate-400">Title, Filename & Intro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title / Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Document Name or Description *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Annual Science Fair Highlights"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-slate-800 font-medium placeholder:text-slate-400"
              />
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1">
                <span>Target filename:</span>
                <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {previewFilename}
                </span>
              </div>
            </div>

            {/* Optional Introductory Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Introductory Text <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                rows={3}
                placeholder="Brief summary or introductory paragraph to appear before the photos..."
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-xs text-slate-800 placeholder:text-slate-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Photo Upload & Ordering */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
              <span>Upload & Arrange Photos</span>
            </h2>
            {images.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-slate-500">
                  {images.length} {images.length === 1 ? 'photo' : 'photos'} added
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          <PhotoDropzone onFilesSelected={handleFilesAdded} />

          {/* Photos Grid */}
          {images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Rearrange photos or edit individual captions:</span>
                <span className="text-[11px] text-slate-400">Use arrow buttons to adjust order</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <PhotoCard
                    key={img.id}
                    image={img}
                    index={idx}
                    total={images.length}
                    onMove={handleMove}
                    onCaptionChange={handleCaptionChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Document Layout & Page Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
              <span>Layout & Styling Options</span>
            </h2>
            <span className="text-xs text-slate-400">Page & Image Formatting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Page Orientation */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Page Orientation
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPageOrientation('portrait')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                    pageOrientation === 'portrait'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="w-5 h-7 border-2 border-current rounded-sm" />
                  <span className="text-xs">Portrait (8.5x11")</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPageOrientation('landscape')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1.5 ${
                    pageOrientation === 'landscape'
                      ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="w-7 h-5 border-2 border-current rounded-sm" />
                  <span className="text-xs">Landscape (11x8.5")</span>
                </button>
              </div>
            </div>

            {/* Image Alignment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Image Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'left', label: 'Left', icon: AlignLeft },
                  { id: 'center', label: 'Center', icon: AlignCenter },
                  { id: 'right', label: 'Right', icon: AlignRight },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setImageAlignment(item.id as any)}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                        imageAlignment === item.id
                          ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Sizing Preset */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Photo Sizing Preset
              </label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="standard">Standard (5.5" width - Balanced)</option>
                <option value="large">Large (6.4" width - High Detail)</option>
                <option value="full">Full Width (Fills Printable Margins)</option>
                <option value="compact">Compact (4.2" width - Space Saver)</option>
              </select>
              <p className="text-[11px] text-slate-400 leading-tight">
                Maintains original photo aspect ratio while fitting Word margins cleanly.
              </p>
            </div>
          </div>

          {/* Toggle: One Image Per Page */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-800">
                Page Break Between Photos
              </label>
              <p className="text-xs text-slate-500">
                Places each photo on its own individual Word document page.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={oneImagePerPage}
                onChange={(e) => setOneImagePerPage(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            {images.length > 0 ? (
              <span className="font-medium text-slate-800">
                Ready to generate: {images.length} photos in <span className="font-semibold text-blue-600">{previewFilename}</span>
              </span>
            ) : (
              <span>Add photos above to enable generation</span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={images.length === 0 || isGenerating}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-bold shadow-md shadow-blue-500/20 disabled:shadow-none active:scale-95 transition"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Word Doc...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Word Document</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Generation Progress Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Generating Word Document</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{generationStep}</p>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full w-full animate-pulse rounded-full" />
            </div>
            <p className="text-[11px] text-slate-400">
              Processing high-resolution images & assembling standard .docx container
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
