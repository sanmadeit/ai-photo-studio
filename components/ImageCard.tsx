
import React from 'react';
import { ProcessedImage, ImageStatus } from '../types';
import Spinner from './Spinner';
import { DownloadIcon, ErrorIcon } from './IconComponents';

interface ImageCardProps {
  image: ProcessedImage;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {

  const downloadImage = () => {
    if (image.transformedUrl) {
        const link = document.createElement('a');
        link.href = image.transformedUrl;
        link.download = `studio_${image.originalFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  const renderTransformedContent = () => {
    switch (image.status) {
      case ImageStatus.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-800/50">
            <Spinner />
            <p className="mt-2 text-sm text-gray-300">Enhancing...</p>
          </div>
        );
      case ImageStatus.SUCCESS:
        return (
          image.transformedUrl && (
            <div className="relative group">
                <img src={image.transformedUrl} alt="Transformed product" className="w-full h-full object-contain" />
                <button 
                    onClick={downloadImage}
                    className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-opacity-75"
                    aria-label="Download image"
                >
                    <DownloadIcon className="w-5 h-5"/>
                </button>
            </div>
          )
        );
      case ImageStatus.ERROR:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-red-900/20 p-4 text-center">
            <ErrorIcon className="w-8 h-8 text-red-400 mb-2"/>
            <p className="text-sm font-semibold text-red-400">Transformation Failed</p>
            <p className="text-xs text-gray-400 mt-1">{image.error}</p>
          </div>
        );
      default: // IDLE
        return (
          <div className="flex items-center justify-center h-full bg-gray-800/50">
            <p className="text-gray-500">Awaiting transformation</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative p-2 aspect-square">
          <img src={image.originalUrl} alt={image.originalFile.name} className="w-full h-full object-contain" />
           <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">Original</span>
        </div>
        <div className="relative p-2 aspect-square border-t-2 md:border-t-0 md:border-l-2 border-gray-700">
           {renderTransformedContent()}
           {image.status === ImageStatus.SUCCESS && <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-md">Studio Quality</span>}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
