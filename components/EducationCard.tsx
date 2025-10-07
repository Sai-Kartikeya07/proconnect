"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IEducation } from "@/types/profile";
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award,
  Edit,
  Trash2
} from "lucide-react";

interface EducationCardProps {
  education: IEducation;
  isOwnProfile: boolean;
  onEdit: (education: IEducation) => void;
  onDelete: (educationId: string) => void;
}

export default function EducationCard({ 
  education, 
  isOwnProfile, 
  onEdit, 
  onDelete 
}: EducationCardProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this education record?')) return;
    
    try {
      const response = await fetch(`/api/education/${education.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onDelete(education.id);
      } else {
        alert('Failed to delete education record');
      }
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Failed to delete education record');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getDateRange = () => {
    const startDate = formatDate(education.start_date);
    const endDate = education.is_current ? 'Present' : formatDate(education.end_date);
    
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    } else if (startDate) {
      return startDate;
    } else if (endDate && endDate !== 'Present') {
      return endDate;
    }
    return null;
  };

  return (
    <div className="bg-[#27272a] rounded-lg border border-[#3f3f46] p-6 hover:border-blue-500/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-600 rounded-lg p-3">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-semibold text-white">
                {education.degree}
              </h3>
              {education.is_current && (
                <Badge className="bg-green-600 text-white text-xs">
                  Current
                </Badge>
              )}
            </div>
            
            <p className="text-neutral-300 font-medium mb-1">
              {education.institution}
            </p>
            
            {education.field_of_study && (
              <p className="text-gray-400 text-sm">
                {education.field_of_study}
              </p>
            )}
          </div>
        </div>
        
        {isOwnProfile && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(education)}
              className="text-neutral-400 hover:text-purple-400"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {getDateRange() && (
              <div className="flex items-center space-x-1 text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{getDateRange()}</span>
              </div>
            )}
            
            {education.grade && (
              <div className="flex items-center space-x-1 text-gray-400">
                <Award className="h-4 w-4" />
                <span>{education.grade}</span>
              </div>
            )}
          </div>
        </div>
        
        {education.description && (
          <div className="mt-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              {education.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}