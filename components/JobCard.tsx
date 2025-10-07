"use client";

import React from "react";
import { IJob } from "@/types/job";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign, 
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react";
import ReactTimeago from "react-timeago";

interface JobCardProps {
  job: IJob;
  currentUserId?: string;
  onEdit: (job: IJob) => void;
  onDelete: (jobId: string) => void;
}

const getJobTypeColor = (type: string) => {
  switch (type) {
    case 'full-time':
      return 'bg-green-600';
    case 'part-time':
      return 'bg-blue-600';
    case 'contract':
      return 'bg-purple-600';
    case 'internship':
      return 'bg-orange-600';
    case 'remote':
      return 'bg-teal-600';
    default:
      return 'bg-gray-600';
  }
};

export default function JobCard({ job, currentUserId, onEdit, onDelete }: JobCardProps) {
  const isOwner = currentUserId === job.posted_by;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onDelete(job.id);
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    }
  };

  return (
  <div className="surface-card glow p-8 transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={job.posted_by_image || undefined} />
            <AvatarFallback>
              {job.posted_by_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base text-gray-400">Posted by {job.posted_by_name}</p>
            <p className="text-sm text-gray-500">
              <ReactTimeago date={new Date(job.created_at)} />
            </p>
          </div>
        </div>
        
        {isOwner && (
          <div className="flex space-x-3">
            <Button
              size="default"
              variant="outline"
              onClick={() => onEdit(job)}
              className="text-neutral-400 hover:text-purple-400 px-4 py-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="default"
              variant="outline"
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 px-4 py-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Job Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-white pr-4">{job.title}</h3>
          <Badge className={`${getJobTypeColor(job.type)} text-white flex-shrink-0`}>
            {job.type.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-6 text-base text-gray-400">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>{job.company}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>{job.location}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>{job.salary_range}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-300 text-base line-clamp-3 leading-relaxed">
          {job.description}
        </p>
        
        {job.requirements && (
          <div className="space-y-3">
            <h4 className="text-base font-medium text-white">Requirements:</h4>
            <p className="text-gray-400 text-base line-clamp-2 leading-relaxed">
              {job.requirements}
            </p>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#3f3f46]">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Posted <ReactTimeago date={new Date(job.created_at)} /></span>
        </div>
        
        <Button
          size="default"
          onClick={() => window.location.href = `/jobs/${job.id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  );
}