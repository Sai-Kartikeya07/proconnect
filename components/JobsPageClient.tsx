"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IJob } from "@/types/job";
import JobCard from "./JobCard";
import JobForm from "./JobForm";
import { Plus, Briefcase } from "lucide-react";

interface JobsPageClientProps {
  initialJobs: IJob[];
}

export default function JobsPageClient({ initialJobs }: JobsPageClientProps) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<IJob[]>(initialJobs);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<IJob | null>(null);

  // Check for edit parameter in URL
  useEffect(() => {
    const editJobId = searchParams.get('edit');
    if (editJobId && user) {
      const jobToEdit = jobs.find(job => job.id === editJobId && job.posted_by === user.id);
      if (jobToEdit) {
        setEditingJob(jobToEdit);
        setShowJobForm(true);
      }
    }
  }, [searchParams, jobs, user]);

  const handleJobCreated = (newJob: IJob) => {
    setJobs([newJob, ...jobs]);
    setShowJobForm(false);
  };

  const handleJobUpdated = (updatedJob: IJob) => {
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    setEditingJob(null);
    setShowJobForm(false);
    // Clear edit parameter from URL
    if (searchParams.get('edit')) {
      window.history.replaceState({}, '', '/jobs');
    }
  };

  const handleJobDeleted = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const handleEditJob = (job: IJob) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setShowJobForm(false);
    // Clear edit parameter from URL
    if (searchParams.get('edit')) {
      window.history.replaceState({}, '', '/jobs');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between py-4 will-animate fade-up" style={{animationDelay:'0ms'}}>
        <div className="flex items-center space-x-4">
          <Briefcase className="h-10 w-10 text-purple-500" />
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Job Board</h1>
            <p className="text-gray-400 text-lg">Discover opportunities and post job openings</p>
          </div>
        </div>
        
        {user && (
          <Button
            onClick={() => setShowJobForm(!showJobForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base h-12"
            size="default"
          >
            <Plus className="h-5 w-5 mr-3" />
            Post a Job
          </Button>
        )}
      </div>

      {/* Job Form */}
      {showJobForm && (
  <div className="surface-card glow p-8 will-animate fade-up" style={{animationDelay:'100ms'}}>
          <JobForm
            editingJob={editingJob}
            onJobCreated={handleJobCreated}
            onJobUpdated={handleJobUpdated}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-6 will-animate fade-up" style={{animationDelay:'150ms'}}>
        <div className="flex items-center justify-between py-2">
          <h2 className="text-2xl font-semibold text-white">
            Available Jobs ({jobs.length})
          </h2>
        </div>
        
        {jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-20 w-20 text-gray-500 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-white mb-3">
              No jobs posted yet
            </h3>
            <p className="text-gray-400 mb-6 text-lg">
              Be the first to post a job opportunity!
            </p>
            {user && (
              <Button
                onClick={() => setShowJobForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base h-12"
                size="default"
              >
                Post the First Job
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {jobs.map((job, idx) => (
              <div key={job.id} className="will-animate fade-up" style={{animationDelay: `${Math.min(200 + idx*50, 500)}ms`}}>
                <JobCard
                  job={job}
                  currentUserId={user?.id}
                  onEdit={handleEditJob}
                  onDelete={handleJobDeleted}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}