
import React, { useState, useCallback } from 'react';
import { ProcessedImage, ImageStatus } from './types';
import { transformImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ImageCard from './components/ImageCard';
import { WandIcon, TrashIcon } from './components/IconComponents';

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });

const App: React.FC = () => {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages: ProcessedImage[] = files.map(file => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      originalFile: file,
      originalUrl: URL.createObjectURL(file),
      transformedUrl: null,
      status: ImageStatus.IDLE,
      error: null,
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
  }, []);

  const handleTransform = async () => {
    if (!images.some(img => img.status === ImageStatus.IDLE)) return;
    
    setIsProcessing(true);

    const transformationPromises = images
      .filter(image => image.status === ImageStatus.IDLE)
      .map(async (image) => {
        setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: ImageStatus.PROCESSING } : img));
        
        try {
          const base64Image = await fileToBase64(image.originalFile);
          const transformedBase64 = await transformImage(base64Image, image.originalFile.type);
          const transformedUrl = `data:${image.originalFile.type};base64,${transformedBase64}`;
          setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: ImageStatus.SUCCESS, transformedUrl } : img));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          setImages(prev => prev.map(img => img.id === image.id ? { ...img, status: ImageStatus.ERROR, error: errorMessage } : img));
        }
      });

    await Promise.all(transformationPromises);
    setIsProcessing(false);
  };
  
  const handleClear = () => {
    images.forEach(image => URL.revokeObjectURL(image.originalUrl));
    setImages([]);
  };

  const hasIdleImages = images.some(img => img.status === ImageStatus.IDLE);

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                AI Product Photo Studio
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Upload your product photos and let AI transform them into studio-quality images, perfect for your e-commerce store.
            </p>
        </header>

        <main>
          <div className="bg-gray-800/50 rounded-xl shadow-2xl p-6 mb-8">
              <ImageUploader onFilesSelected={handleFilesSelected} disabled={isProcessing} />
              
              {images.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                    <button
                        onClick={handleTransform}
                        disabled={!hasIdleImages || isProcessing}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        <WandIcon className="w-5 h-5"/>
                        {isProcessing ? 'Processing...' : `Transform ${images.filter(i => i.status === ImageStatus.IDLE).length} Images`}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 text-base font-semibold text-gray-300 bg-gray-700 rounded-lg shadow-md hover:bg-gray-600 disabled:opacity-50 transition-all duration-300"
                    >
                       <TrashIcon className="w-5 h-5"/>
                        Clear All
                    </button>
                </div>
              )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {images.map(image => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
