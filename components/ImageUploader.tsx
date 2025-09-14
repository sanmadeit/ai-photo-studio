
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './IconComponents';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    
    // Fix: Explicitly type `file` as `File` to resolve TypeScript error.
    const files = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected, disabled]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Explicitly type `file` as `File` to resolve TypeScript error.
      const files = Array.from(e.target.files).filter((file: File) => file.type.startsWith('image/'));
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex justify-center w-full h-48 px-4 transition bg-gray-800 border-2 ${
          isDragging ? 'border-indigo-400' : 'border-gray-600'
        } border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none ${
            disabled ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        <span className="flex flex-col items-center justify-center space-y-2 text-gray-400">
          <UploadIcon className="w-12 h-12" />
          <span className="font-medium">
            <span className="text-indigo-400">Click to upload</span> or drag and drop
          </span>
          <span className="text-xs">PNG, JPG, GIF up to 10MB</span>
        </span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default ImageUploader;