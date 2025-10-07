"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { IJob } from "@/types/job";
import { 
  ArrowLeft,
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit,
  Trash2,
  ExternalLink,
  User,
  Briefcase,
  Clock,
  CheckCircle
} from "lucide-react";
import ReactTimeago from "react-timeago";

interface JobDetailsClientProps {
  job: IJob;
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

export default function JobDetailsClient({ job }: JobDetailsClientProps) {
  const { user } = useUser();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  
  const isOwner = user?.id === job.posted_by;

  const handleEdit = () => {
    router.push(`/jobs?edit=${job.id}`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/jobs');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const handleApply = () => {
    // This could be extended to open an email client or application form
    alert('Application functionality would be implemented here. For now, contact the job poster directly.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        
        {isOwner && (
          <div className="flex space-x-3">
            <Button
              onClick={handleEdit}
              variant="outline"
              className="text-blue-400 hover:text-blue-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Job
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="outline"
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* Job Details Card */}
      <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] overflow-hidden">
        {/* Header Section */}
        <div className="p-8 border-b border-[#3f3f46]">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 rounded-lg p-4">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                  <Badge className={`${getJobTypeColor(job.type)} text-white`}>
                    {job.type.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-xl text-blue-400 font-medium mb-3">{job.company}</p>
                
                <div className="flex items-center space-x-6 text-gray-400">
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
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Posted <ReactTimeago date={new Date(job.created_at)} /></span>
                  </div>
                </div>
              </div>
            </div>
            
            {!isOwner && (
              <Button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Apply Now
              </Button>
            )}
          </div>
          
          {/* Posted By */}
          <div className="flex items-center space-x-3 p-4 bg-[#27272a] rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={job.posted_by_image || undefined} />
              <AvatarFallback>
                {job.posted_by_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">Posted by {job.posted_by_name}</p>
              <p className="text-gray-400 text-sm">
                <ReactTimeago date={new Date(job.created_at)} />
              </p>
            </div>
          </div>
        </div>
        
        {/* Job Description */}
        <div className="p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <ExternalLink className="h-5 w-5 mr-2" />
              Job Description
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          </div>
          
          {job.requirements && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Requirements
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            </div>
          )}
          
          {/* Job Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#3f3f46]">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Job Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Company</p>
                    <p className="text-white">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Job Type</p>
                    <p className="text-white">{job.type.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Additional Details</h3>
              <div className="space-y-3">
                {job.salary_range && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-sm">Salary Range</p>
                      <p className="text-white">{job.salary_range}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Posted</p>
                    <p className="text-white">
                      <ReactTimeago date={new Date(job.created_at)} />
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Posted by</p>
                    <p className="text-white">{job.posted_by_name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Apply Section */}
        {!isOwner && (
          <div className="p-8 bg-[#27272a] border-t border-[#3f3f46]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-white mb-2">
                Interested in this position?
              </h3>
              <p className="text-gray-400 mb-4">
                Apply now to get in touch with the employer
              </p>
              <Button
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Apply for this Job
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}