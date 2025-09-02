
import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Share2, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

// Enhanced ImagePreview Component
const ImagePreview = ({ 
  isOpen, 
  onClose, 
  images = [], 
  currentIndex = 0, 
  alt, 
  title, 
  description,
  showControls = true 
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeImageIndex, setActiveImageIndex] = useState(currentIndex);

  const imageList = Array.isArray(images) ? images : [images].filter(Boolean);
  const hasMultipleImages = imageList.length > 1;
  const currentImage = imageList[activeImageIndex] || imageList[0];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setActiveImageIndex(currentIndex);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      switch(e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': e.preventDefault(); handlePrevImage(); break;
        case 'ArrowRight': e.preventDefault(); handleNextImage(); break;
        case '=': case '+': e.preventDefault(); handleZoomIn(); break;
        case '-': e.preventDefault(); handleZoomOut(); break;
        case 'r': case 'R': e.preventDefault(); handleRotate(); break;
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeImageIndex]);

  const handleNextImage = () => {
    if (hasMultipleImages) {
      setActiveImageIndex((prev) => (prev + 1) % imageList.length);
      resetImageTransform();
    }
  };

  const handlePrevImage = () => {
    if (hasMultipleImages) {
      setActiveImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
      resetImageTransform();
    }
  };

  const resetImageTransform = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => prev + 90);
  const handleReset = () => resetImageTransform();

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-90 transition-opacity" onClick={onClose} />
      
      <div className="relative w-full h-full flex flex-col">
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-20 p-3 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
          style={{ minWidth: '48px', minHeight: '48px' }}
        >
          <X size={24} />
        </button>

        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImage}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNextImage}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-all duration-200"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <div className="relative z-10 flex items-start justify-between p-4 pr-20 bg-black bg-opacity-50">
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-white text-base sm:text-lg font-semibold truncate">{title}</h3>}
            {description && <p className="text-gray-300 text-xs sm:text-sm truncate mt-1">{description}</p>}
            {hasMultipleImages && <p className="text-gray-400 text-xs mt-1">Image {activeImageIndex + 1} of {imageList.length}</p>}
          </div>
        </div>

        <div 
          className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            src={currentImage}
            alt={alt}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
          />
        </div>

        {showControls && (
          <div className="relative z-10 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="hidden sm:flex items-center justify-between p-4">
              <div className="flex items-center space-x-2">
                {hasMultipleImages && (
                  <>
                    <button onClick={handlePrevImage} className="p-2 text-white hover:bg-gray-500 hover:bg-opacity-20 rounded-full transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextImage} className="p-2 text-white hover:bg-gray-500 hover:bg-opacity-20 rounded-full transition-colors">
                      <ChevronRight size={20} />
                    </button>
                    <div className="w-px h-6 bg-white bg-opacity-30 mx-2" />
                  </>
                )}
                <button onClick={handleZoomOut} className="p-2 text-white hover:bg-gray-500 hover:bg-opacity-20 rounded-full transition-colors">
                  <ZoomOut size={20} />
                </button>
                <button onClick={handleZoomIn} className="p-2 text-white hover:bg-gray-500 hover:bg-opacity-20 rounded-full transition-colors">
                  <ZoomIn size={20} />
                </button>
                <button onClick={handleRotate} className="p-2 text-white hover:bg-gray-500 hover:bg-opacity-20 rounded-full transition-colors">
                  <RotateCw size={20} />
                </button>
                <button onClick={handleReset} className="px-3 py-2 text-white text-sm hover:bg-gray-500 hover:bg-opacity-20 rounded transition-colors">
                  Reset
                </button>
              </div>
              <div className="flex items-center space-x-4 text-white text-sm">
                {hasMultipleImages && <span>{activeImageIndex + 1} of {imageList.length}</span>}
                <span>Scale: {Math.round(scale * 100)}%</span>
                <span>Rotation: {rotation % 360}°</span>
              </div>
            </div>

            <div className="sm:hidden p-4">
              <div className="flex items-center justify-center space-x-2">
                {hasMultipleImages && (
                  <>
                    <button onClick={handlePrevImage} className="flex flex-col items-center justify-center p-3 text-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <ChevronLeft size={20} />
                      <span className="text-xs mt-1">Prev</span>
                    </button>
                    <button onClick={handleNextImage} className="flex flex-col items-center justify-center p-3 text-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors" style={{ minWidth: '60px', minHeight: '60px' }}>
                      <ChevronRight size={20} />
                      <span className="text-xs mt-1">Next</span>
                    </button>
                  </>
                )}
                <button onClick={handleZoomOut} className="flex flex-col items-center justify-center p-3 text-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors" style={{ minWidth: '60px', minHeight: '60px' }}>
                  <ZoomOut size={20} />
                  <span className="text-xs mt-1">Zoom Out</span>
                </button>
                <button onClick={handleZoomIn} className="flex flex-col items-center justify-center p-3 text-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors" style={{ minWidth: '60px', minHeight: '60px' }}>
                  <ZoomIn size={20} />
                  <span className="text-xs mt-1">Zoom In</span>
                </button>
                <button onClick={handleRotate} className="flex flex-col items-center justify-center p-3 text-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-colors" style={{ minWidth: '60px', minHeight: '60px' }}>
                  <RotateCw size={20} />
                  <span className="text-xs mt-1">Rotate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook for managing image preview state
export const useImagePreview = () => {
  const [preview, setPreview] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0,
    alt: '',
    title: '',
    description: ''
  });

  const openPreview = (images, currentIndex = 0, alt = '', title = '', description = '') => {
    const imageList = Array.isArray(images) ? images : [images];
    setPreview({
      isOpen: true,
      images: imageList,
      currentIndex: Math.max(0, Math.min(currentIndex, imageList.length - 1)),
      alt, title, description
    });
  };

  const closePreview = () => setPreview(prev => ({ ...prev, isOpen: false }));

  return { preview, openPreview, closePreview };
};

export default ImagePreview;