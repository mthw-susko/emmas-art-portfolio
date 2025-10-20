'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import Image from 'next/image';

interface PortraitUploadProps {
  currentPortraitUrl?: string;
  isAdmin?: boolean;
}

export default function PortraitUpload({ currentPortraitUrl, isAdmin = false }: PortraitUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  console.log('PortraitUpload: currentPortraitUrl:', currentPortraitUrl, 'isAdmin:', isAdmin);
  console.log('PortraitUpload: uploading:', uploading, 'error:', error);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Upload image to Firebase Storage
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const imageRef = ref(storage, `about/portrait-${Date.now()}.${fileExtension}`);
      const snapshot = await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // Update or create the about document in Firestore
      const aboutDoc = doc(db, 'about', 'content');
      try {
        console.log('PortraitUpload: Updating Firestore with new portrait URL:', imageUrl);
        await updateDoc(aboutDoc, { portraitUrl: imageUrl });
        console.log('PortraitUpload: Successfully updated Firestore');
      } catch (updateError) {
        console.log('PortraitUpload: Document does not exist, creating new one', updateError);
        // If document doesn't exist, create it
        const { setDoc } = await import('firebase/firestore');
        await setDoc(aboutDoc, { 
          portraitUrl: imageUrl,
          bio: "Emma is a freelance artist and designer based in [Location]. She studied design and has been creating beautiful artwork for clients around the world. Her work focuses on [art style/theme] and she loves working with [mediums]. When she's not creating art, you can find her [hobbies/interests].",
          email: "emmafleming@icloud.com",
          instagram: "https://www.instagram.com/emmasartalbum/",
          skills: [
            { name: "Digital Illustration", percentage: 100 },
            { name: "Watercolor Painting", percentage: 95 },
            { name: "Portrait Drawing", percentage: 90 },
            { name: "Graphic Design", percentage: 85 },
            { name: "Photography", percentage: 80 },
            { name: "Print Design", percentage: 75 },
          ],
          clients: ["Client One", "Client Two", "Client Three", "Client Four"],
        });
        console.log('PortraitUpload: Successfully created new Firestore document');
      }

      // The Firestore listener will handle the state update
      // No need to call onUpdate as it can cause conflicts
      
      // Clear the file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading portrait:', error);
      setError('Failed to upload portrait. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      <div className="relative h-96 lg:h-[600px]">
        {uploading ? (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
              <span className="text-gray-600">Uploading...</span>
            </div>
          </div>
        ) : currentPortraitUrl ? (
          <Image
            key={currentPortraitUrl} // Force re-render when URL changes
            src={currentPortraitUrl}
            alt="Emma"
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            onLoad={() => console.log('PortraitUpload: Image loaded successfully')}
            onError={(e) => console.error('PortraitUpload: Image failed to load', e)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Portrait coming soon</span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-red-100 bg-opacity-90 rounded-lg flex items-center justify-center">
            <p className="text-red-700 text-center p-4">{error}</p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none">
          <motion.label
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer pointer-events-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="bg-white px-4 py-2 rounded-md shadow-lg border">
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-sm text-gray-700">Uploading...</span>
                </div>
              ) : (
                <span className="text-sm text-gray-700">Click to upload portrait</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </motion.label>
        </div>
      )}

      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 text-red-700 text-sm p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
