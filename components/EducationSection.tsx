"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IEducation } from "@/types/profile";
import EducationForm from "./EducationForm";
import EducationCard from "./EducationCard";
import { GraduationCap, Plus } from "lucide-react";

interface EducationSectionProps {
  education: IEducation[];
  isOwnProfile: boolean;
  userId: string;
}

export default function EducationSection({ 
  education: initialEducation, 
  isOwnProfile, 
  userId 
}: EducationSectionProps) {
  const [education, setEducation] = useState<IEducation[]>(initialEducation);
  const [showForm, setShowForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<IEducation | null>(null);

  const handleEducationCreated = (newEducation: IEducation) => {
    setEducation([newEducation, ...education]);
    setShowForm(false);
  };

  const handleEducationUpdated = (updatedEducation: IEducation) => {
    setEducation(education.map(edu => 
      edu.id === updatedEducation.id ? updatedEducation : edu
    ));
    setEditingEducation(null);
    setShowForm(false);
  };

  const handleEducationDeleted = (educationId: string) => {
    setEducation(education.filter(edu => edu.id !== educationId));
  };

  const handleEdit = (edu: IEducation) => {
    setEditingEducation(edu);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setEditingEducation(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <GraduationCap className="h-6 w-6 mr-3" />
          Education
        </h2>
        
        {isOwnProfile && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        )}
      </div>

      {/* Education Form */}
      {showForm && (
        <div className="bg-[#27272a] rounded-lg border border-[#3f3f46] p-6">
          <EducationForm
            editingEducation={editingEducation}
            onEducationCreated={handleEducationCreated}
            onEducationUpdated={handleEducationUpdated}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Education List */}
      <div className="space-y-4">
        {education.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No education added yet
            </h3>
            <p className="text-gray-400 mb-4">
              {isOwnProfile 
                ? "Add your educational background to showcase your qualifications"
                : "This user hasn't added their educational background yet"
              }
            </p>
          </div>
        ) : (
          education.map((edu) => (
            <EducationCard
              key={edu.id}
              education={edu}
              isOwnProfile={isOwnProfile}
              onEdit={handleEdit}
              onDelete={handleEducationDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}