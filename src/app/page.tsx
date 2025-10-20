'use client';

import { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import { db } from '@/lib/firebase';
import { Artwork } from '@/types';
import ArtworkGrid from '@/components/ArtworkGrid';
import ArtworkUploadModal from '@/components/ArtworkUploadModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function Home() {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [deletingArtwork, setDeletingArtwork] = useState<Artwork | null>(null);

  const handleUploadSuccess = () => {
    // The ArtworkGrid will automatically refresh due to real-time Firestore listener
    console.log('Artwork uploaded successfully');
  };

  const handleEditArtwork = (artwork: Artwork) => {
    console.log('Edit artwork clicked:', artwork);
    setEditingArtwork(artwork);
  };

  const handleDeleteArtwork = (artwork: Artwork) => {
    console.log('Delete artwork clicked:', artwork.title);
    setDeletingArtwork(artwork);
  };

  const confirmDelete = async () => {
    if (!deletingArtwork) return;
    
    try {
      console.log('Deleting artwork from Firestore...');
      await deleteDoc(doc(db, 'artworks', deletingArtwork.id));
      console.log('Artwork deleted successfully');
      setDeletingArtwork(null);
    } catch (error) {
      console.error('Error deleting artwork:', error);
      alert('Failed to delete artwork. Please try again.');
      throw error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {user && (
        <div className="mb-8 text-center">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg shadow-lg hover:shadow-xl"
          >
            + Add New Artwork
          </button>
          <p className="mt-2 text-sm text-gray-500">
            💡 Drag and drop artwork to reorder them
          </p>
        </div>
      )}
      
      <ArtworkGrid 
        isAdmin={!!user} 
        onEditArtwork={handleEditArtwork}
        onDeleteArtwork={handleDeleteArtwork}
      />
      
      <ArtworkUploadModal
        isOpen={showUploadModal || !!editingArtwork}
        onClose={() => {
          setShowUploadModal(false);
          setEditingArtwork(null);
        }}
        onSuccess={() => {
          handleUploadSuccess();
          setEditingArtwork(null);
        }}
        editingArtwork={editingArtwork}
      />

      <DeleteConfirmModal
        isOpen={!!deletingArtwork}
        artworkTitle={deletingArtwork?.title || ''}
        onClose={() => setDeletingArtwork(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
