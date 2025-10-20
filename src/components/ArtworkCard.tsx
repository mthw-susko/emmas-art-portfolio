'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Artwork } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ArtworkCardProps {
  artwork: Artwork;
  index: number;
  isAdmin?: boolean;
  onEdit?: (artwork: Artwork) => void;
  onDelete?: (artwork: Artwork) => void;
  isDraggable?: boolean;
}

export default function ArtworkCard({ 
  artwork, 
  index, 
  isAdmin = false, 
  onEdit, 
  onDelete,
  isDraggable = false
}: ArtworkCardProps) {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: artwork.id,
    disabled: !isDraggable 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    // Reset loading state when image URL changes
    setImageLoaded(false);
    setImageDimensions(null);
    
    // Load image to get dimensions for natural aspect ratio display
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = artwork.imageUrl;
  }, [artwork.imageUrl]);

  const cardContent = (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: isDragging ? 1 : 1.02 }}
      className={`group cursor-pointer ${isDragging ? 'z-50' : ''}`}
      {...(isDraggable ? attributes : {})}
    >
      <div className="relative overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
        {/* Clickable Image Area */}
        <Link href={`/artwork/${artwork.id}`} className="block">
          <div className="relative w-full">
            {!imageLoaded && (
              <div className="w-full aspect-square bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              </div>
            )}
            {imageDimensions && (
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                width={imageDimensions.width}
                height={imageDimensions.height}
                className={`w-full h-auto object-cover group-hover:scale-105 transition-all duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>
        </Link>
        
        {/* Admin Controls - Outside of Link */}
        {isAdmin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(artwork);
                }}
                className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 hover:scale-110 transition-transform"
                title="Edit artwork"
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(artwork);
                }}
                className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:scale-110 transition-transform"
                title="Delete artwork"
              >
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Drag Handle for Admin - Outside of Link */}
        {isAdmin && isDraggable && (
          <div 
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20"
            {...listeners}
          >
            <div className="p-2 bg-white rounded-full shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  return cardContent;
}
