'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SkillBarProps {
  skill: {
    name: string;
    percentage: number;
  };
  isAdmin?: boolean;
  onUpdate?: (name: string, percentage: number) => void;
  onEdit?: (name: string, newName: string) => void;
  onDelete?: (name: string) => void;
}

export default function SkillBar({ skill, isAdmin = false, onUpdate, onEdit, onDelete }: SkillBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(skill.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAdmin && onUpdate) {
      onUpdate(skill.name, parseInt(e.target.value));
    }
  };

  const handleEditSubmit = () => {
    if (editName.trim() && onEdit) {
      onEdit(skill.name, editName.trim());
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditName(skill.name);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(skill.name);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-sm font-medium text-gray-500 border border-gray-300 rounded px-2 py-1 flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') handleEditCancel();
              }}
            />
            <button
              onClick={handleEditSubmit}
              className="text-green-600 hover:text-green-800 p-1"
              disabled={!editName.trim()}
              title="Save changes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onClick={handleEditCancel}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Cancel editing"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-gray-500">{skill.name}</span>
        )}
        {isAdmin ? (
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="100"
              value={skill.percentage}
              onChange={handlePercentageChange}
              className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 w-8">{skill.percentage}%</span>
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit skill name"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete skill"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500">{skill.percentage}%</span>
        )}
      </div>
      <div className="w-full bg-blue-100 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${skill.percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
        />
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Skill</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &ldquo;{skill.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
