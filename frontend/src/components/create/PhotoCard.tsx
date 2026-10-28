import React from 'react';
import { ArrowLeft, ArrowRight, Trash2, Tag } from 'lucide-react';
import type { ImageItem } from '../../types';

interface PhotoCardProps {
  image: ImageItem;
  index: number;
  total: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  image,
  index,
  total,
  onMove,
  onCaptionChange,
  onRemove,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-300 transition-all flex flex-col group">
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={image.previewUrl}
          alt={image.name}
          className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
        />

        {/* Order Badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold">
          #{index + 1}
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(image.id)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 hover:bg-red-50 text-slate-600 hover:text-red-600 backdrop-blur-sm shadow-sm transition"
          title="Remove photo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Quick Reorder Overlay Bar */}
        <div className="absolute bottom-2 inset-x-2 flex justify-between items-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="p-1 rounded-md bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40 shadow-sm transition"
            title="Move Earlier"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-semibold text-white bg-slate-900/70 px-2 py-0.5 rounded-full">
            {formatSize(image.size)}
          </span>
          <button
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            className="p-1 rounded-md bg-white/90 text-slate-700 hover:bg-white disabled:opacity-40 shadow-sm transition"
            title="Move Later"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Caption & Metadata */}
      <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-white">
        <div>
          <p className="text-xs font-semibold text-slate-800 truncate" title={image.name}>
            {image.name}
          </p>
          <div className="mt-2 relative">
            <Tag className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={image.caption}
              onChange={(e) => onCaptionChange(image.id, e.target.value)}
              placeholder="Add caption (e.g., Figure 1)..."
              className="w-full text-xs pl-7 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
