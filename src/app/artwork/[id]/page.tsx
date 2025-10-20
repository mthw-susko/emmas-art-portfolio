'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Artwork } from '@/types';
import ArtworkGrid from '@/components/ArtworkGrid';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ArtworkPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ArtworkPage({ params }: ArtworkPageProps) {
  const { id } = use(params);
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setImageLoading(true); // Reset image loading when ID changes
    const artworkDoc = doc(db, 'artworks', id);
    
    const unsubscribe = onSnapshot(artworkDoc, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setArtwork({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Artwork);
      } else {
        setArtwork(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (artwork) {
      // Load image to get natural dimensions
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = artwork.imageUrl;
    }
  }, [artwork]);

  if (loading) {
    return <LoadingSpinner text="Loading artwork..." />;
  }

  if (!artwork) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Artwork Not Found</h1>
        <Link href="/" className="text-blue-500 hover:text-blue-600">
          ← Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-500 hover:text-blue-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Gallery
        </Link>
      </motion.div>

      {/* Focused Artwork */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="relative w-full flex justify-center mb-6">
          {imageLoading && (
            <div className="w-full min-h-[400px] bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
          )}
          {imageDimensions && (
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              width={imageDimensions.width}
              height={imageDimensions.height}
              className={`max-w-full h-auto shadow-lg transition-opacity duration-300 ${
                imageLoading ? 'opacity-0 absolute' : 'opacity-100'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              priority
              onLoad={() => setImageLoading(false)}
            />
          )}
        </div>
        
        <div className="text-center">
          {artwork.title && artwork.title.trim() !== '' && (
            <h1 className="text-3xl md:text-4xl font-bold text-blue-500 mb-4">
              {artwork.title}
            </h1>
          )}
          {artwork.description && (
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {artwork.description}
            </p>
          )}
        </div>
      </motion.div>

      {/* More Works Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-blue-500 mb-8 text-center">
          More Works
        </h2>
        <ArtworkGrid excludeId={artwork.id} />
      </motion.div>
    </div>
  );
}
