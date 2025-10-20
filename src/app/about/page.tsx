'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { AboutContent } from '@/types';
import SkillBar from '@/components/SkillBar';
import AddSkillForm from '@/components/AddSkillForm';
import ContactForm from '@/components/ContactForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import PortraitUpload from '@/components/PortraitUpload';

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddSkillForm, setShowAddSkillForm] = useState(false);
  const [sectionVisibility, setSectionVisibility] = useState({
    about: true,
    contact: true,
    skills: true,
    clients: true,
    contactForm: true,
  });
  const { user } = useAuth();

  useEffect(() => {
    const aboutDoc = doc(db, 'about', 'content');
    
    const unsubscribe = onSnapshot(aboutDoc, (doc) => {
      if (doc.exists()) {
        setAboutContent(doc.data() as AboutContent);
      } else {
        // Set default content if no document exists
        setAboutContent({
          bio: "Emma is a freelance artist and designer based in [Location]. She studied design and has been creating beautiful artwork for clients around the world. Her work focuses on [art style/theme] and she loves working with [mediums]. When she's not creating art, you can find her [hobbies/interests].",
          email: "emmafleming@icloud.com",
          instagram: "https://www.instagram.com/emmasartalbum/",
          portraitUrl: undefined, // Explicitly set to undefined for consistency
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
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleSkillUpdate = async (name: string, percentage: number) => {
    if (!aboutContent) return;
    
    const updatedSkills = aboutContent.skills.map(skill => 
      skill.name === name ? { ...skill, percentage } : skill
    );
    
    setAboutContent({
      ...aboutContent,
      skills: updatedSkills,
    });
    
    // Save to Firestore
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

  const handleAddSkill = async (name: string, percentage: number) => {
    if (!aboutContent) return;
    
    const newSkill = { name, percentage };
    const updatedSkills = [...aboutContent.skills, newSkill];
    
    setAboutContent({ ...aboutContent, skills: updatedSkills });
    setShowAddSkillForm(false);
    
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { skills: updatedSkills });
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleEditSkill = async (oldName: string, newName: string) => {
    if (!aboutContent) return;
    
    const updatedSkills = aboutContent.skills.map(skill => 
      skill.name === oldName ? { ...skill, name: newName } : skill
    );
    
    setAboutContent({ ...aboutContent, skills: updatedSkills });
    
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { skills: updatedSkills });
    } catch (error) {
      console.error('Error editing skill:', error);
    }
  };

  const handleDeleteSkill = async (name: string) => {
    if (!aboutContent) return;
    
    const updatedSkills = aboutContent.skills.filter(skill => skill.name !== name);
    
    setAboutContent({ ...aboutContent, skills: updatedSkills });
    
    try {
      const aboutDoc = doc(db, 'about', 'content');
      await updateDoc(aboutDoc, { skills: updatedSkills });
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const toggleSectionVisibility = (section: keyof typeof sectionVisibility) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Section wrapper component for admin visibility controls
  const SectionWrapper = ({ 
    sectionKey, 
    title, 
    children 
  }: { 
    sectionKey: keyof typeof sectionVisibility; 
    title: string; 
    children: React.ReactNode; 
  }) => {
    const isVisible = sectionVisibility[sectionKey];
    
    // If section is hidden and user is not admin, don't render anything
    if (!isVisible && !user) {
      return null;
    }
    
    return (
      <div className="transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-500">{title}</h2>
          {user && (
            <button
              onClick={() => toggleSectionVisibility(sectionKey)}
              className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
              title={isVisible ? 'Hide section' : 'Show section'}
            >
              {isVisible ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              )}
            </button>
          )}
        </div>
        {isVisible && children}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading about page..." />;
  }

  if (!aboutContent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">About content not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Portrait Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="order-1 lg:order-1"
        >
          <PortraitUpload
            currentPortraitUrl={aboutContent.portraitUrl}
            isAdmin={!!user}
          />
        </motion.div>

        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="order-2 lg:order-2 space-y-8"
        >
          {/* About Section */}
          <SectionWrapper sectionKey="about" title="ABOUT">
            {user ? (
              <textarea
                value={aboutContent.bio}
                onChange={(e) => handleBioUpdate(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                placeholder="Enter your bio..."
              />
            ) : (
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {aboutContent.bio}
              </div>
            )}
          </SectionWrapper>

          {/* Contact Info */}
          <SectionWrapper sectionKey="contact" title="CONTACT">
            <div className="flex items-center space-x-4">
              <a
                href={`mailto:${aboutContent.email}`}
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                {aboutContent.email}
              </a>
              <a
                href={aboutContent.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </SectionWrapper>

          {/* Skills Section */}
          <SectionWrapper sectionKey="skills" title="SKILLS + EXPERIENCE">
            <div className="space-y-2">
              {user && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setShowAddSkillForm(true)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
                  >
                    + Add Skill
                  </button>
                </div>
              )}
              {showAddSkillForm && (
                <AddSkillForm
                  onAdd={handleAddSkill}
                  onCancel={() => setShowAddSkillForm(false)}
                />
              )}
              {aboutContent.skills.map((skill) => (
                <SkillBar
                  key={skill.name}
                  skill={skill}
                  isAdmin={!!user}
                  onUpdate={handleSkillUpdate}
                  onEdit={handleEditSkill}
                  onDelete={handleDeleteSkill}
                />
              ))}
            </div>
          </SectionWrapper>

          {/* Clients Section */}
          <SectionWrapper sectionKey="clients" title="SELECTED CLIENTS">
            {user ? (
              <textarea
                value={aboutContent.clients.join(' / ')}
                onChange={(e) => handleClientsUpdate(e.target.value.split(' / ').filter(c => c.trim()))}
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-600"
                placeholder="Client One / Client Two / Client Three"
              />
            ) : (
              <p className="text-gray-600">
                {aboutContent.clients.join(' / ')}
              </p>
            )}
          </SectionWrapper>

          {/* Contact Form */}
          <SectionWrapper sectionKey="contactForm" title="CONTACT ME">
            <ContactForm />
          </SectionWrapper>
        </motion.div>
      </div>
    </div>
  );
}
