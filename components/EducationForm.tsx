"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IEducation, ICreateEducation } from "@/types/profile";
import { X } from "lucide-react";

interface EducationFormProps {
  editingEducation?: IEducation | null;
  onEducationCreated: (education: IEducation) => void;
  onEducationUpdated: (education: IEducation) => void;
  onCancel: () => void;
}

export default function EducationForm({ 
  editingEducation, 
  onEducationCreated, 
  onEducationUpdated, 
  onCancel 
}: EducationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ICreateEducation>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
    description: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (editingEducation) {
      setFormData({
        institution: editingEducation.institution,
        degree: editingEducation.degree,
        field_of_study: editingEducation.field_of_study || '',
        start_date: editingEducation.start_date || '',
        end_date: editingEducation.end_date || '',
        is_current: editingEducation.is_current,
        grade: editingEducation.grade || '',
        description: editingEducation.description || '',
      });
    }
  }, [editingEducation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingEducation ? `/api/education/${editingEducation.id}` : '/api/education';
      const method = editingEducation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingEducation) {
          onEducationUpdated(result.education);
        } else {
          onEducationCreated(result.education);
        }
        // Reset form
        setFormData({
          institution: '',
          degree: '',
          field_of_study: '',
          start_date: '',
          end_date: '',
          is_current: false,
          grade: '',
          description: '',
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save education');
      }
    } catch (error) {
      console.error('Error saving education:', error);
      alert('Failed to save education');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {editingEducation ? 'Edit Education' : 'Add Education'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Institution */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Institution *
            </label>
            <input
              type="text"
              required
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Harvard University"
            />
          </div>

          {/* Degree */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Degree *
            </label>
            <input
              type="text"
              required
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Bachelor of Science"
            />
          </div>

          {/* Field of Study */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Field of Study
            </label>
            <input
              type="text"
              value={formData.field_of_study}
              onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Computer Science"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Grade/GPA
            </label>
            <input
              type="text"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 3.8 GPA or First Class"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              disabled={formData.is_current}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Is Current */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_current"
            checked={formData.is_current}
            onChange={(e) => setFormData({ 
              ...formData, 
              is_current: e.target.checked,
              end_date: e.target.checked ? '' : formData.end_date
            })}
            className="w-4 h-4 text-blue-600 bg-[#27272a] border-[#3f3f46] rounded focus:ring-blue-500"
          />
          <label htmlFor="is_current" className="text-sm text-gray-300">
            I am currently studying here
          </label>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Describe your studies, achievements, or relevant coursework..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Saving...' : editingEducation ? 'Update' : 'Add Education'}
          </Button>
        </div>
      </form>
    </div>
  );
}