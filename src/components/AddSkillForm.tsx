'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface AddSkillFormProps {
  onAdd: (name: string, percentage: number) => void;
  onCancel: () => void;
}

export default function AddSkillForm({ onAdd, onCancel }: AddSkillFormProps) {
  const [skillName, setSkillName] = useState('');
  const [percentage, setPercentage] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillName.trim()) {
      onAdd(skillName.trim(), percentage);
      setSkillName('');
      setPercentage(50);
    }
  };

  const handleCancel = () => {
    setSkillName('');
    setPercentage(50);
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4"
    >
      <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Skill</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="Skill name (e.g., Photoshop, JavaScript)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            autoFocus
          />
        </div>
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-600 whitespace-nowrap">Proficiency:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-500 w-8">{percentage}%</span>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={!skillName.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add Skill
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}

