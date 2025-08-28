import React, { useState, useEffect, useCallback } from "react";

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
  showThumbnails?: boolean;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'custom';
  onImageChange?: (index: number) => void;
}

const ImageSlider = ({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showIndicators = true,
  showThumbnails = false,
  className = "",
  aspectRatio = 'square',
  onImageChange
}: ImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    custom: ''
  };

  const goToNext = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [images.length, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [images.length, isTransitioning]);

  const goToImage = useCallback((index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [currentIndex, isTransitioning]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, images.length]);

  // Callback on image change
  useEffect(() => {
    onImageChange?.(currentIndex);
  }, [currentIndex, onImageChange]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${aspectRatioClasses[aspectRatio]} ${className}`}>
        <p className="text-gray-500">Aucune image disponible</p>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className={`relative overflow-hidden rounded-lg ${aspectRatioClasses[aspectRatio]} ${className}`}>
        <img
          src={images[0]}
          alt="Produit"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/assets/placeholder.jpg";
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Slider principal */}
      <div className={`relative overflow-hidden rounded-lg ${aspectRatioClasses[aspectRatio]}`}>
        {/* Images */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Image ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/assets/placeholder.jpg";
              }}
            />
          ))}
        </div>

        {/* Contrôles de navigation */}
        {showControls && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              aria-label="Image précédente"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110"
              aria-label="Image suivante"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indicateurs */}
        {showIndicators && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white scale-125 shadow-lg'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Compteur d'images */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Miniatures */}
      {showThumbnails && images.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-500 scale-105 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Miniature ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/assets/placeholder.jpg";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
