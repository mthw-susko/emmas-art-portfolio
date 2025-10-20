'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Artwork, AboutContent } from '@/types';
import ArtworkGrid from '@/components/ArtworkGrid';
import SkillBar from '@/components/SkillBar';
import LoadingSpinner from '@/components/LoadingSpinner';
import PortraitUpload from '@/components/PortraitUpload';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'artworks' | 'about'>('artworks');
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [aboutLoading, setAboutLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const docRef = doc(db, 'about', 'content');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      console.log('Admin: Firestore about content updated:', docSnap.data());
      if (docSnap.exists()) {
        const data = docSnap.data() as AboutContent;
        console.log('Admin: Setting about content with portrait URL:', data.portraitUrl);
        setAboutContent(data);
      } else {
        console.log("No about content found for admin!");
        setAboutContent({
          bio: "Welcome to my portfolio! I am an artist passionate about creating unique and expressive pieces. Explore my work and feel free to reach out.",
          email: "emmafleming@icloud.com",
          instagram: "https://www.instagram.com/emmasartalbum/",
          portraitUrl: undefined,
          skills: [
            { name: "Painting", percentage: 90 },
            { name: "Sculpting", percentage: 75 },
            { name: "Digital Art", percentage: 85 },
          ],
          clients: ["Client A", "Client B", "Client C"]
        });
      }
      setAboutLoading(false);
    }, (error) => {
      console.error('Admin: Firestore listener error:', error);
      setAboutLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditArtwork = (artwork: Artwork) => {
    // TODO: Implement artwork editing modal
    console.log('Edit artwork:', artwork);
  };

  const handleDeleteArtwork = (artwork: Artwork) => {
    // TODO: Implement artwork deletion
    console.log('Delete artwork:', artwork.id);
  };

  const handleAddArtwork = () => {
    // TODO: Implement add artwork modal
    console.log('Add new artwork');
  };

  const handleSkillUpdate = async (name: string, percentage: number) => {
    if (!aboutContent) return;
    const updatedSkills = aboutContent.skills.map(skill =>
      skill.name === name ? { ...skill, percentage } : skill
    );
    setAboutContent({ ...aboutContent, skills: updatedSkills });
    
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { skills: updatedSkills });
    } catch (error) {
      console.error('Error updating skills:', error);
    }
  };

  const handleBioUpdate = async (newBio: string) => {
    if (!aboutContent) return;
    setAboutContent({ ...aboutContent, bio: newBio });
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { bio: newBio });
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleEmailUpdate = async (newEmail: string) => {
    if (!aboutContent) return;
    setAboutContent({ ...aboutContent, email: newEmail });
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { email: newEmail });
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handleInstagramUpdate = async (newInstagram: string) => {
    if (!aboutContent) return;
    setAboutContent({ ...aboutContent, instagram: newInstagram });
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { instagram: newInstagram });
    } catch (error) {
      console.error('Error updating Instagram:', error);
    }
  };

  const handleClientsUpdate = async (newClients: string[]) => {
    if (!aboutContent) return;
    setAboutContent({ ...aboutContent, clients: newClients });
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { clients: newClients });
    } catch (error) {
      console.error('Error updating clients:', error);
    }
  };


  if (loading || aboutLoading) {
    return <LoadingSpinner text="Loading admin panel..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-700 mb-4">Admin Dashboard</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('artworks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'artworks'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Artworks
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-white text-gray-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            About Page
          </button>
        </div>
      </motion.div>

      {/* Artworks Tab */}
      {activeTab === 'artworks' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Manage Artworks</h2>
            <button
              onClick={handleAddArtwork}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              Add New Artwork
            </button>
          </div>
          
          <ArtworkGrid
            isAdmin={true}
            onEditArtwork={handleEditArtwork}
            onDeleteArtwork={handleDeleteArtwork}
          />
        </motion.div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Edit About Page</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Portrait Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Portrait Photo</h3>
              <div key={aboutContent?.portraitUrl || 'no-portrait'}>
                <PortraitUpload
                  currentPortraitUrl={aboutContent?.portraitUrl || undefined}
                  isAdmin={true}
                />
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Bio</h3>
              <textarea
                value={aboutContent?.bio || ''}
                onChange={(e) => handleBioUpdate(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                placeholder="Enter your bio..."
              />
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={aboutContent?.email || ''}
                    onChange={(e) => handleEmailUpdate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={aboutContent?.instagram || ''}
                    onChange={(e) => handleInstagramUpdate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Skills</h3>
              <div className="space-y-4">
                {aboutContent?.skills?.map((skill) => (
                  <SkillBar
                    key={skill.name}
                    skill={skill}
                    isAdmin={true}
                    onUpdate={handleSkillUpdate}
                  />
                ))}
              </div>
            </div>

            {/* Clients Section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Clients</h3>
              <textarea
                value={aboutContent?.clients?.join(' / ') || ''}
                onChange={(e) => handleClientsUpdate(e.target.value.split(' / ').filter(c => c.trim()))}
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                placeholder="Client One / Client Two / Client Three"
              />
            </div>
          </div>

          {/* Auto-save notification */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              💾 Changes are saved automatically
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
