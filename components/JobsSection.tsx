"use client";
import React from "react";
import Link from "next/link";
import { Briefcase, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

function JobsSection() {
  return (
    <div className="bg-[#18181b] rounded-xl border border-[#3f3f46] overflow-hidden shadow-md mt-6">
      <div className="h-16 bg-gradient-to-r from-[#27272a] to-[#3f3f46] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Briefcase className="h-6 w-6 text-white" />
          <span className="text-white font-semibold text-xl">Jobs</span>
        </div>
      </div>
      <div className="px-6 py-6 space-y-5">
        <p className="text-[#a1a1aa] text-base leading-relaxed">
          Discover career opportunities and connect with employers.
        </p>
        
        <div className="space-y-3">
          <Link href="/jobs">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base py-3 h-12"
              size="default"
            >
              <Briefcase className="h-5 w-5 mr-3" />
              Browse Jobs
            </Button>
          </Link>
          
          <Link href="/jobs">
            <Button 
              variant="outline" 
              className="w-full text-base border-[#3f3f46] text-gray-300 hover:text-white hover:bg-[#3f3f46] py-3 h-12"
              size="default"
            >
              <ExternalLink className="h-5 w-5 mr-3" />
              Post a Job
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default JobsSection;
