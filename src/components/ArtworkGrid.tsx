'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Artwork } from '@/types';
import ArtworkCard from './ArtworkCard';
import LoadingSpinner from './LoadingSpinner';
import Masonry from 'react-masonry-css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface ArtworkGridProps {
  isAdmin?: boolean;
  onEditArtwork?: (artwork: Artwork) => void;
  onDeleteArtwork?: (artwork: Artwork) => void;
  excludeId?: string; // For "more works" section
}

export default function ArtworkGrid({ 
  isAdmin = false, 
  onEditArtwork, 
  onDeleteArtwork,
  excludeId 
}: ArtworkGridProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const q = query(collection(db, 'artworks'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const artworksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Artwork[];

      // Filter out excluded artwork if specified
      const filteredArtworks = excludeId 
        ? artworksData.filter(artwork => artwork.id !== excludeId)
        : artworksData;

      setArtworks(filteredArtworks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [excludeId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = artworks.findIndex((artwork) => artwork.id === active.id);
      const newIndex = artworks.findIndex((artwork) => artwork.id === over?.id);

      const newArtworks = arrayMove(artworks, oldIndex, newIndex);
      setArtworks(newArtworks);

      // Update order in Firestore
      try {
        const batch = writeBatch(db);
        
        newArtworks.forEach((artwork, index) => {
          const artworkRef = doc(db, 'artworks', artwork.id);
          batch.update(artworkRef, { order: index });
        });
        
        await batch.commit();
      } catch (error) {
        console.error('Error updating artwork order:', error);
        // Revert on error
        setArtworks(artworks);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading artworks..." />;
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No artworks found</p>
        {isAdmin && (
          <p className="text-gray-400 text-sm mt-2">Upload some artwork to get started</p>
        )}
      </div>
    );
  }

  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1
  };

  const gridContent = (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-6 w-auto"
      columnClassName="pl-6 bg-clip-padding"
    >
      {artworks.map((artwork, index) => (
        <div key={artwork.id} className="mb-6">
          <ArtworkCard
            artwork={artwork}
            index={index}
            isAdmin={isAdmin}
            onEdit={onEditArtwork}
            onDelete={onDeleteArtwork}
            isDraggable={isAdmin}
          />
        </div>
      ))}
    </Masonry>
  );

  if (isAdmin) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={artworks.map(artwork => artwork.id)} strategy={verticalListSortingStrategy}>
          {gridContent}
        </SortableContext>
      </DndContext>
    );
  }

  return gridContent;
}
