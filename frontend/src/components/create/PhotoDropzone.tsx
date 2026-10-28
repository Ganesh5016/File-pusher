import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface PhotoDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({
  onFilesSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB

  const validateAndAddFiles = (fileList: FileList | File[]) => {
    setValidationError(null);
    const validFiles: File[] = [];
    const errors: string[] = [];

    const filesArray = Array.from(fileList);

    if (filesArray.length === 0) return;

    for (const file of filesArray) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      
      // Extension and MIME validation
      if (!allowedExtensions.includes(ext) && !allowedTypes.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported format (JPG, PNG, WEBP).`);
        continue;
      }

      // Size check
      if (file.size > maxSizeBytes) {
        errors.push(`"${file.name}" exceeds the 25MB size limit.`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setValidationError(errors[0] + (errors.length > 1 ? ` (+${errors.length - 1} other files rejected)` : ''));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/70 scale-[0.99] shadow-inner'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100/80 shadow-sm">
          <UploadCloud className="w-7 h-7 stroke-[1.75]" />
        </div>

        <h3 className="text-base font-bold text-slate-800">
          Drag & drop photos here, or <span className="text-blue-600 hover:underline">browse files</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
          Supports high-resolution JPG, JPEG, PNG, and WEBP. Images are automatically rotated according to camera EXIF orientation.
        </p>

        <div className="mt-4 flex items-center justify-center space-x-3 text-[11px] text-slate-400 font-medium">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Max 25MB / photo</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">Multiple selection enabled</span>
        </div>
      </div>

      {validationError && (
        <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
