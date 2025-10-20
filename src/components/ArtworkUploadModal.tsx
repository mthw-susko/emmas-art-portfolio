'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { Artwork } from '@/types';

interface ArtworkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingArtwork?: Artwork | null;
}

export default function ArtworkUploadModal({ isOpen, onClose, onSuccess, editingArtwork }: ArtworkUploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with editing artwork data
  useEffect(() => {
    if (editingArtwork) {
      setTitle(editingArtwork.title);
      setDescription(editingArtwork.description || '');
      setFile(null); // Reset file selection
    } else {
      setTitle('');
      setDescription('');
      setFile(null);
    }
  }, [editingArtwork]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setUploading(true);
    setError('');
    
    try {
      let imageUrl = editingArtwork?.imageUrl;

      // Upload new image if file is selected
      if (file) {
        const imageRef = ref(storage, `artworks/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(imageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      if (editingArtwork) {
        // Update existing artwork
        await updateDoc(doc(db, 'artworks', editingArtwork.id), {
          title: title || '',
          description: description || '',
          ...(imageUrl && { imageUrl }), // Only update imageUrl if new file was uploaded
        });
      } else {
        // Create new artwork
        if (!file) {
          setError('Please select an image file.');
          setUploading(false);
          return;
        }
        
        // Get the current highest order value to append to the end
        const artworksQuery = query(collection(db, 'artworks'), orderBy('order', 'desc'));
        const snapshot = await getDocs(artworksQuery);
        const maxOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order || 0);
        
        await addDoc(collection(db, 'artworks'), {
          title: title || '',
          description: description || '',
          imageUrl,
          order: maxOrder + 1, // Add to the end of the list
          createdAt: new Date(),
        });
      }

      onSuccess();
      
      // Small delay to allow Firestore listener to process the update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (error) {
      console.error('Error saving artwork:', error);
      setError(`Failed to ${editingArtwork ? 'update' : 'upload'} artwork. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-700">
            {editingArtwork ? 'Edit Artwork' : 'Add New Artwork'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                placeholder="Optional title for the artwork..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                rows={3}
                placeholder="Optional description of the artwork..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Image {!editingArtwork && '*'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required={!editingArtwork}
              />
              {editingArtwork && (
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to keep current image
                </p>
              )}
              {file && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50"
                disabled={uploading || (!editingArtwork && !file)}
              >
                {uploading 
                  ? (editingArtwork ? 'Updating...' : 'Uploading...') 
                  : (editingArtwork ? 'Update' : 'Upload')
                }
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
