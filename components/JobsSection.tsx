"use client";
import React from "react";
import Link from "next/link";
import { Briefcase, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

function JobsSection() {
  return (
  <div className="surface-card glow hoverable overflow-hidden mt-6">{/* Animation applied by page wrapper */}
      {/* Header Bar */}
      <div className="h-16 bg-gradient-to-r from-[#27272a] to-[#3f3f46] flex items-center justify-center px-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-white" />
          <span className="text-white typ-h tracking-tight">Jobs</span>
        </div>
      </div>
      {/* Content */}
      <div className="px-7 py-7 space-y-6">
  <p className="text-[#b3b3b7] typ-body">
          Discover career opportunities and connect with employers.
        </p>
        <div className="space-y-4">
          <Link href="/jobs" className="block">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-12 rounded-lg shadow-sm hover:shadow transition-shadow"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Browse Jobs
            </Button>
          </Link>
          <Link href="/jobs" className="block">
            <Button 
              variant="outline" 
              className="w-full text-sm font-medium h-12 rounded-lg border-[#3f3f46] text-gray-300 hover:text-white hover:bg-[#2b2b31] shadow-sm hover:shadow transition-shadow"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JobsSection;
